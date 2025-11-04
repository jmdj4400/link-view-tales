-- Create beta_whitelist table for managing beta access
CREATE TABLE IF NOT EXISTS public.beta_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.beta_whitelist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if their email is whitelisted
CREATE POLICY "Anyone can check whitelist status"
  ON public.beta_whitelist
  FOR SELECT
  USING (true);

-- Only admins can manage the whitelist (you can adjust this based on your admin logic)
CREATE POLICY "Service role can manage whitelist"
  ON public.beta_whitelist
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_beta_whitelist_email ON public.beta_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_beta_whitelist_status ON public.beta_whitelist(status);