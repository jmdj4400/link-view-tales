-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create email_log table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on email_log
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
ON public.email_log
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage all email logs
CREATE POLICY "Service role can manage email logs"
ON public.email_log
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Update handle_new_user function to send welcome email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_request_id BIGINT;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, handle, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'handle', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );
  
  -- Create subscription
  INSERT INTO public.subscriptions (user_id, status)
  VALUES (NEW.id, 'active');
  
  -- Send welcome email via edge function (non-blocking)
  BEGIN
    SELECT net.http_post(
      url := 'https://ppfudytrnjfyngrebhxo.supabase.co/functions/v1/send-onboarding-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZnVkeXRybmpmeW5ncmViaHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTI1NzAsImV4cCI6MjA3NzYyODU3MH0.uoBBTVJ6fA4zIXZH3QkpTXR2tLgUrQRa--6maPSoo5g'
      ),
      body := jsonb_build_object(
        'userId', NEW.id,
        'emailType', 'welcome'
      )
    ) INTO v_request_id;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to send welcome email for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on auth.users (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;