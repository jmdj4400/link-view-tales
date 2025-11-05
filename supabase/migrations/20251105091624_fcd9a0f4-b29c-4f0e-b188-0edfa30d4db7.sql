-- Drop the existing public_profiles view
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view with all theme customization columns
CREATE VIEW public.public_profiles
WITH (security_invoker=on)
AS
SELECT 
  id,
  handle,
  name,
  bio,
  avatar_url,
  theme,
  created_at,
  primary_color,
  secondary_color,
  background_color,
  text_color,
  accent_color,
  heading_font,
  body_font,
  layout_style,
  button_style,
  card_style,
  background_pattern,
  background_image_url
FROM profiles;

-- Grant access to anon and authenticated users
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;