-- Fix 1: Update is_email_whitelisted function to include search_path
DROP FUNCTION IF EXISTS public.is_email_whitelisted(text);

CREATE OR REPLACE FUNCTION public.is_email_whitelisted(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.beta_whitelist
    WHERE email = check_email AND status = 'approved'
  );
$$;

-- Fix 2: Drop and recreate public_profiles view to only expose non-sensitive data
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  handle,
  name,
  bio,
  avatar_url,
  theme,
  created_at
FROM public.profiles;

-- Fix 3: Add input validation constraints (allowing uppercase in handles)
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_name_length CHECK (char_length(name) <= 100),
ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 500),
ADD CONSTRAINT profiles_handle_length CHECK (char_length(handle) <= 50),
ADD CONSTRAINT profiles_handle_format CHECK (handle ~ '^[a-zA-Z0-9_-]+$');

ALTER TABLE public.links
ADD CONSTRAINT links_title_length CHECK (char_length(title) <= 200),
ADD CONSTRAINT links_dest_url_length CHECK (char_length(dest_url) <= 2048),
ADD CONSTRAINT links_utm_source_length CHECK (char_length(utm_source) <= 100),
ADD CONSTRAINT links_utm_medium_length CHECK (char_length(utm_medium) <= 100),
ADD CONSTRAINT links_utm_campaign_length CHECK (char_length(utm_campaign) <= 100);

-- Fix 4: Create rate limiting table for redirect handler
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits are publicly readable for checking"
ON public.rate_limits FOR SELECT
USING (true);

CREATE POLICY "Rate limits can be inserted by anyone"
ON public.rate_limits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Rate limits can be updated by anyone"
ON public.rate_limits FOR UPDATE
USING (true);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_requests integer,
  p_window_minutes integer
)
RETURNS boolean
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