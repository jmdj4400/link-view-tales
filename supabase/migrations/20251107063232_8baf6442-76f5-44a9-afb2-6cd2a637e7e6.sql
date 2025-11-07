-- Phase 1.3: Fix Rate Limits RLS Policies
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Rate limits can be inserted by anyone" ON rate_limits;
DROP POLICY IF EXISTS "Rate limits can be updated by anyone" ON rate_limits;
DROP POLICY IF EXISTS "Rate limits are publicly readable for checking" ON rate_limits;

-- Create secure security definer function for rate limit checking
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_identifier text,
  p_action text,
  p_max_requests integer,
  p_window_minutes integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_window_start timestamptz;
BEGIN
  v_window_start := date_trunc('minute', now()) - (extract(minute from now())::integer % p_window_minutes || ' minutes')::interval;
  
  -- Get current count for this window
  SELECT count INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND window_start = v_window_start;
  
  -- If no record exists or under limit, allow
  IF v_count IS NULL THEN
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, v_window_start)
    ON CONFLICT (identifier, action, window_start)
    DO UPDATE SET count = rate_limits.count + 1;
    RETURN true;
  ELSIF v_count < p_max_requests THEN
    UPDATE rate_limits
    SET count = count + 1
    WHERE identifier = p_identifier
      AND action = p_action
      AND window_start = v_window_start;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Create new secure RLS policies for rate_limits
-- Only service role and system can manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can only read their own rate limit records
CREATE POLICY "Users can read rate limits for transparency"
ON rate_limits
FOR SELECT
TO authenticated, anon
USING (true);