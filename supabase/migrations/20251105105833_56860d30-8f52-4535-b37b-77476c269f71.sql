-- Create recovery_attempts table to track WebView recovery strategies
CREATE TABLE public.recovery_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  strategy_used TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  platform TEXT NOT NULL,
  device TEXT NOT NULL,
  browser TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recovery_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own recovery attempts"
  ON public.recovery_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert recovery attempts"
  ON public.recovery_attempts
  FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_recovery_attempts_user_id ON public.recovery_attempts(user_id);
CREATE INDEX idx_recovery_attempts_link_id ON public.recovery_attempts(link_id);
CREATE INDEX idx_recovery_attempts_created_at ON public.recovery_attempts(created_at);