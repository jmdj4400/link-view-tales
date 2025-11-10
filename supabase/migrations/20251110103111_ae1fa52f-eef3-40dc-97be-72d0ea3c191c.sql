-- Create auth_logs table for tracking authentication events
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'signup', 'signin', 'signout', 'password_reset_request', 'password_reset_complete', 'email_verification', 'session_refresh', 'auth_error'
  status TEXT NOT NULL, -- 'success', 'failure', 'pending'
  error_code TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX idx_auth_logs_event_type ON public.auth_logs(event_type);
CREATE INDEX idx_auth_logs_status ON public.auth_logs(status);
CREATE INDEX idx_auth_logs_created_at ON public.auth_logs(created_at DESC);
CREATE INDEX idx_auth_logs_user_event ON public.auth_logs(user_id, event_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own auth logs
CREATE POLICY "Users can view their own auth logs"
  ON public.auth_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert auth logs (for server-side logging)
CREATE POLICY "Service role can insert auth logs"
  ON public.auth_logs
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all auth logs
CREATE POLICY "Admins can view all auth logs"
  ON public.auth_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE public.auth_logs IS 'Comprehensive authentication event logging for security monitoring and debugging';