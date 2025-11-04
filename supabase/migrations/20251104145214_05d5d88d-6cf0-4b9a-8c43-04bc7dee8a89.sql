-- Fix Beta Whitelist Exposure
-- Drop the public policy that exposes all beta tester emails
DROP POLICY IF EXISTS "Anyone can check whitelist status" ON public.beta_whitelist;

-- Create secure function to check whitelist status without exposing the list
CREATE OR REPLACE FUNCTION public.is_email_whitelisted(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.beta_whitelist
    WHERE email = check_email AND status = 'approved'
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_email_whitelisted(text) TO anon, authenticated;

-- Fix grant_trial Authorization
-- Add authorization check to prevent users from granting trials to other accounts
CREATE OR REPLACE FUNCTION public.grant_trial(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CRITICAL: Verify the caller is modifying their own account
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only grant trials to your own account';
  END IF;
  
  -- Update subscriptions table
  UPDATE subscriptions
  SET 
    trial_granted = true,
    trial_end_date = NOW() + INTERVAL '30 days',
    status = 'trialing'
  WHERE user_id = p_user_id;

  -- Update profiles table to reflect pro_trial plan
  UPDATE profiles
  SET plan = 'pro'
  WHERE id = p_user_id;
END;
$$;

-- Fix audit_logs RLS Policies
-- Allow authenticated users to insert their own audit logs
CREATE POLICY "Users can create own audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Prevent all updates (audit logs should be immutable)
CREATE POLICY "Nobody can update audit logs"
ON public.audit_logs
FOR UPDATE
TO authenticated
USING (false);

-- Prevent all deletes (audit logs are permanent)
CREATE POLICY "Nobody can delete audit logs"
ON public.audit_logs
FOR DELETE
TO authenticated
USING (false);

-- Fix metrics_daily RLS Policies
-- Allow service role to manage metrics (for aggregate-metrics edge function)
CREATE POLICY "Service role can manage metrics"
ON public.metrics_daily
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Prevent users from updating metrics
CREATE POLICY "Users cannot modify metrics"
ON public.metrics_daily
FOR UPDATE
TO authenticated
USING (false);

-- Prevent users from deleting metrics
CREATE POLICY "Users cannot delete metrics"
ON public.metrics_daily
FOR DELETE
TO authenticated
USING (false);