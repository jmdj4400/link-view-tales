-- =====================================================
-- Phase 1: Database Schema Extensions
-- LinkPeek Advanced Features (Firewall + Scorecard + Radar)
-- =====================================================

-- 1. CREATE SCORECARDS TABLE
-- Purpose: Store signed performance scorecards for public sharing
CREATE TABLE public.scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, period_start, period_end)
);

-- Index for fast user lookups
CREATE INDEX idx_scorecards_user_id ON public.scorecards(user_id);
CREATE INDEX idx_scorecards_period ON public.scorecards(period_start, period_end);

-- Enable RLS
ALTER TABLE public.scorecards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scorecards
CREATE POLICY "Scorecards are publicly readable"
  ON public.scorecards 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own scorecards"
  ON public.scorecards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scorecards"
  ON public.scorecards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scorecards"
  ON public.scorecards 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. CREATE INCIDENTS TABLE
-- Purpose: Track platform/region redirect health incidents
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  country TEXT,
  device TEXT,
  error_rate NUMERIC(5,2) NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  affected_users INTEGER DEFAULT 0,
  sample_size INTEGER DEFAULT 0,
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_incidents_platform ON public.incidents(platform);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_detected_at ON public.incidents(detected_at DESC);
CREATE INDEX idx_incidents_active ON public.incidents(detected_at) WHERE resolved_at IS NULL;

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policy for incidents
CREATE POLICY "Incidents are publicly readable"
  ON public.incidents 
  FOR SELECT 
  USING (true);

-- 3. EXTEND REDIRECTS TABLE
-- Add firewall tracking columns
ALTER TABLE public.redirects 
ADD COLUMN IF NOT EXISTS avoided_failure BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS firewall_strategy TEXT,
ADD COLUMN IF NOT EXISTS risk_score NUMERIC(5,2);

-- Index for firewall analytics
CREATE INDEX idx_redirects_avoided_failure ON public.redirects(avoided_failure, ts) WHERE avoided_failure = true;

-- 4. EXTEND PROFILES TABLE
-- Add firewall settings
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS firewall_enabled BOOLEAN DEFAULT FALSE;

-- 5. CREATE TRIGGER FOR SCORECARD UPDATED_AT
CREATE TRIGGER update_scorecards_updated_at
  BEFORE UPDATE ON public.scorecards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. CREATE FUNCTION TO CALCULATE RISK SCORE
-- Used by firewall-decision edge function
CREATE OR REPLACE FUNCTION public.calculate_redirect_risk(
  p_platform TEXT,
  p_user_agent TEXT,
  p_country TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failure_rate NUMERIC;
  v_recovery_rate NUMERIC;
  v_risk_score NUMERIC;
BEGIN
  -- Calculate failure rate for this platform/country in last 24 hours
  SELECT 
    COALESCE(
      (COUNT(*) FILTER (WHERE success = false)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      0
    )
  INTO v_failure_rate
  FROM redirects
  WHERE platform = p_platform
    AND (country = p_country OR p_country IS NULL)
    AND ts > NOW() - INTERVAL '24 hours';

  -- Calculate recovery attempt rate
  SELECT 
    COALESCE(
      (COUNT(*)::NUMERIC / 100),
      0
    )
  INTO v_recovery_rate
  FROM recovery_attempts
  WHERE platform = p_platform
    AND browser LIKE '%' || SPLIT_PART(p_user_agent, '/', 1) || '%'
    AND created_at > NOW() - INTERVAL '24 hours';

  -- Combined risk score (0-100)
  v_risk_score := (v_failure_rate * 0.7) + (v_recovery_rate * 0.3);
  
  RETURN LEAST(100, GREATEST(0, v_risk_score));
END;
$$;

-- 7. CREATE FUNCTION TO GET USER SCORECARD DATA
CREATE OR REPLACE FUNCTION public.get_user_scorecard_data(
  p_user_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scorecard JSONB;
BEGIN
  SELECT jsonb_build_object(
    'period', to_char(p_period_start, 'YYYY-MM'),
    'stats', jsonb_build_object(
      'totalClicks', COALESCE(SUM(clicks), 0),
      'totalPageViews', COALESCE(SUM(page_views), 0),
      'conversionRate', COALESCE(ROUND(AVG(NULLIF(conversion_count, 0)::NUMERIC / NULLIF(clicks, 1) * 100), 2), 0),
      'flowIntegrity', COALESCE(ROUND(AVG(flow_integrity_score), 2), 0),
      'redirectSuccess', COALESCE(ROUND(AVG(redirect_success_rate), 2), 0),
      'avgSessionDuration', COALESCE(ROUND(AVG(avg_session_duration)), 0),
      'avgCTR', COALESCE(ROUND(AVG(ctr), 2), 0)
    ),
    'topChannels', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'referrer', top_referrer,
          'clicks', clicks
        )
      )
      FROM (
        SELECT top_referrer, SUM(clicks) as clicks
        FROM metrics_daily
        WHERE user_id = p_user_id
          AND date BETWEEN p_period_start AND p_period_end
          AND top_referrer IS NOT NULL
        GROUP BY top_referrer
        ORDER BY clicks DESC
        LIMIT 5
      ) top
    )
  )
  INTO v_scorecard
  FROM metrics_daily
  WHERE user_id = p_user_id
    AND date BETWEEN p_period_start AND p_period_end;

  RETURN COALESCE(v_scorecard, '{}'::jsonb);
END;
$$;