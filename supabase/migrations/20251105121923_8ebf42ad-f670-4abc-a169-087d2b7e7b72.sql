-- Fix the calculate_redirect_risk function to use browser instead of platform
DROP FUNCTION IF EXISTS public.calculate_redirect_risk(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.calculate_redirect_risk(
  p_browser TEXT,
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
  -- Calculate failure rate for this browser/country in last 24 hours
  SELECT 
    COALESCE(
      (COUNT(*) FILTER (WHERE success = false)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      0
    )
  INTO v_failure_rate
  FROM redirects
  WHERE browser = p_browser
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
  WHERE browser = p_browser
    AND created_at > NOW() - INTERVAL '24 hours';

  -- Combined risk score (0-100)
  v_risk_score := (v_failure_rate * 0.7) + (v_recovery_rate * 0.3);
  
  RETURN LEAST(100, GREATEST(0, v_risk_score));
END;
$$;