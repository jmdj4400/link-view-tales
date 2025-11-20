-- Fix security warnings: Add search_path to all new functions

-- Fix calculate_link_health function
CREATE OR REPLACE FUNCTION calculate_link_health(p_link_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_success_rate NUMERIC;
  v_avg_load_time INTEGER;
  v_recent_failures INTEGER;
BEGIN
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

-- Fix sanitize_url function
CREATE OR REPLACE FUNCTION sanitize_url(p_url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sanitized TEXT;
BEGIN
  v_sanitized := TRIM(p_url);
  
  IF v_sanitized !~ '^https?://' THEN
    v_sanitized := 'https://' || v_sanitized;
  END IF;
  
  v_sanitized := REGEXP_REPLACE(v_sanitized, '[\\x00-\\x1F\\x7F]', '', 'g');
  
  RETURN v_sanitized;
END;
$$;

-- Fix trigger_sanitize_link_url function
CREATE OR REPLACE FUNCTION trigger_sanitize_link_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.sanitized_dest_url := sanitize_url(NEW.dest_url);
  RETURN NEW;
END;
$$;

-- Fix log_redirect_attempt function
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
SECURITY DEFINER
SET search_path = public
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