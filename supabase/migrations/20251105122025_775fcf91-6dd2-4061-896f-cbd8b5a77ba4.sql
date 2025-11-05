-- Add platform column to redirects table for better tracking
ALTER TABLE public.redirects
ADD COLUMN IF NOT EXISTS platform TEXT;

-- Update existing records to extract platform from browser
UPDATE public.redirects
SET platform = CASE
  WHEN browser LIKE '%Instagram%' THEN 'instagram'
  WHEN browser LIKE '%TikTok%' THEN 'tiktok'
  WHEN browser LIKE '%Facebook%' OR browser LIKE '%FB%' THEN 'facebook'
  WHEN browser LIKE '%Twitter%' OR browser LIKE '%X.com%' THEN 'twitter'
  WHEN browser LIKE '%LinkedIn%' THEN 'linkedin'
  WHEN browser LIKE '%Snapchat%' THEN 'snapchat'
  ELSE 'web'
END
WHERE platform IS NULL;

-- Restore the original function that uses platform
DROP FUNCTION IF EXISTS public.calculate_redirect_risk(TEXT, TEXT, TEXT);

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
    AND created_at > NOW() - INTERVAL '24 hours';

  -- Combined risk score (0-100)
  v_risk_score := (v_failure_rate * 0.7) + (v_recovery_rate * 0.3);
  
  RETURN LEAST(100, GREATEST(0, v_risk_score));
END;
$$;