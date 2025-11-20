-- Enhanced data model for robust link tracking and redirect monitoring

-- Add new columns to links table for health monitoring
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS health_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS redirect_chain_length INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS avg_redirect_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS last_failure_reason TEXT,
ADD COLUMN IF NOT EXISTS sanitized_dest_url TEXT;

-- Add new columns to redirects table for detailed tracking
ALTER TABLE redirects
ADD COLUMN IF NOT EXISTS redirect_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS in_app_browser_detected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS load_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS final_url TEXT,
ADD COLUMN IF NOT EXISTS drop_off_stage TEXT,
ADD COLUMN IF NOT EXISTS recovery_strategy_used TEXT;

-- Create index for fast health status lookups
CREATE INDEX IF NOT EXISTS idx_links_health_status ON links(health_status, health_checked_at);

-- Create index for redirect performance analysis
CREATE INDEX IF NOT EXISTS idx_redirects_performance ON redirects(link_id, ts DESC, success);

-- Create index for in-app browser analysis
CREATE INDEX IF NOT EXISTS idx_redirects_in_app_browser ON redirects(in_app_browser_detected, platform, ts DESC);

-- Function to calculate link health score
CREATE OR REPLACE FUNCTION calculate_link_health(p_link_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_success_rate NUMERIC;
  v_avg_load_time INTEGER;
  v_recent_failures INTEGER;
BEGIN
  -- Calculate success rate from last 100 redirects
  SELECT 
    COALESCE(
      (COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      0
    ),
    AVG(load_time_ms) FILTER (WHERE success = true),
    COUNT(*) FILTER (WHERE success = false AND ts > NOW() - INTERVAL '1 hour')
  INTO v_success_rate, v_avg_load_time, v_recent_failures
  FROM redirects
  WHERE link_id = p_link_id
    AND ts > NOW() - INTERVAL '7 days'
  LIMIT 100;
  
  -- Determine health status
  IF v_recent_failures > 5 THEN
    RETURN 'critical';
  ELSIF v_success_rate < 80 THEN
    RETURN 'warning';
  ELSIF v_avg_load_time > 3000 THEN
    RETURN 'slow';
  ELSIF v_success_rate >= 95 THEN
    RETURN 'excellent';
  ELSE
    RETURN 'good';
  END IF;
END;
$$;

-- Function to sanitize and validate URLs
CREATE OR REPLACE FUNCTION sanitize_url(p_url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_sanitized TEXT;
BEGIN
  -- Remove leading/trailing whitespace
  v_sanitized := TRIM(p_url);
  
  -- Ensure protocol exists
  IF v_sanitized !~ '^https?://' THEN
    v_sanitized := 'https://' || v_sanitized;
  END IF;
  
  -- Remove any null bytes or control characters
  v_sanitized := REGEXP_REPLACE(v_sanitized, '[\\x00-\\x1F\\x7F]', '', 'g');
  
  RETURN v_sanitized;
END;
$$;

-- Trigger to auto-sanitize URLs on insert/update
CREATE OR REPLACE FUNCTION trigger_sanitize_link_url()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.sanitized_dest_url := sanitize_url(NEW.dest_url);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sanitize_link_url ON links;
CREATE TRIGGER sanitize_link_url
  BEFORE INSERT OR UPDATE OF dest_url ON links
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sanitize_link_url();

-- Create table for tracking redirect chain analysis
CREATE TABLE IF NOT EXISTS redirect_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  final_url TEXT,
  chain_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_hops INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER,
  detected_issues TEXT[],
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redirect_chains_link ON redirect_chains(link_id, analyzed_at DESC);

-- Enable RLS
ALTER TABLE redirect_chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chains for own links"
  ON redirect_chains FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM links 
    WHERE links.id = redirect_chains.link_id 
    AND links.user_id = auth.uid()
  ));

-- Function to log redirect attempt with detailed tracking
CREATE OR REPLACE FUNCTION log_redirect_attempt(
  p_link_id UUID,
  p_success BOOLEAN,
  p_platform TEXT,
  p_browser TEXT,
  p_device TEXT,
  p_country TEXT,
  p_in_app_browser BOOLEAN,
  p_load_time_ms INTEGER,
  p_redirect_steps JSONB,
  p_final_url TEXT,
  p_drop_off_stage TEXT,
  p_recovery_strategy TEXT,
  p_referrer TEXT,
  p_user_agent TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_redirect_id UUID;
BEGIN
  INSERT INTO redirects (
    link_id,
    success,
    platform,
    browser,
    device,
    country,
    in_app_browser_detected,
    load_time_ms,
    redirect_steps,
    final_url,
    drop_off_stage,
    recovery_strategy_used,
    referrer,
    user_agent,
    ts
  ) VALUES (
    p_link_id,
    p_success,
    p_platform,
    p_browser,
    p_device,
    p_country,
    p_in_app_browser,
    p_load_time_ms,
    p_redirect_steps,
    p_final_url,
    p_drop_off_stage,
    p_recovery_strategy,
    p_referrer,
    p_user_agent,
    NOW()
  )
  RETURNING id INTO v_redirect_id;
  
  RETURN v_redirect_id;
END;
$$;