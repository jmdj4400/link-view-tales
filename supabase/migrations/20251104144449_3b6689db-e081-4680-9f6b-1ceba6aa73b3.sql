-- Remove the overly permissive public SELECT policy from profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Ensure users can still view their own complete profile (including email)
-- Check if policy exists first, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own complete profile'
  ) THEN
    CREATE POLICY "Users can view own complete profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
  END IF;
END $$;

-- Create a view that exposes only non-sensitive public profile fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  handle,
  name,
  bio,
  avatar_url,
  theme,
  plan,
  created_at,
  updated_at
FROM public.profiles;

-- Grant SELECT permission on the view to both anonymous and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;