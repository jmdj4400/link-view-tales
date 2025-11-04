
-- Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view with SECURITY INVOKER (default, more secure)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  handle,
  name,
  bio,
  avatar_url,
  theme,
  created_at
FROM public.profiles;

-- Grant SELECT to public (anonymous users can view public profiles)
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.public_profiles IS 'Public view of profiles - uses SECURITY INVOKER to enforce RLS of querying user';
