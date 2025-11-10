-- Fix the sync_public_profile trigger to use SECURITY DEFINER
-- This allows it to bypass RLS when syncing data from profiles to public_profiles

DROP TRIGGER IF EXISTS sync_public_profile_trigger ON profiles;

CREATE OR REPLACE FUNCTION public.sync_public_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public_profiles (
    id, name, handle, bio, avatar_url, primary_color, secondary_color,
    background_color, text_color, accent_color, heading_font, body_font,
    layout_style, button_style, card_style, background_pattern, 
    background_image_url, theme, created_at
  )
  VALUES (
    NEW.id, NEW.name, NEW.handle, NEW.bio, NEW.avatar_url, NEW.primary_color,
    NEW.secondary_color, NEW.background_color, NEW.text_color, NEW.accent_color,
    NEW.heading_font, NEW.body_font, NEW.layout_style, NEW.button_style,
    NEW.card_style, NEW.background_pattern, NEW.background_image_url, NEW.theme,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    handle = EXCLUDED.handle,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    background_color = EXCLUDED.background_color,
    text_color = EXCLUDED.text_color,
    accent_color = EXCLUDED.accent_color,
    heading_font = EXCLUDED.heading_font,
    body_font = EXCLUDED.body_font,
    layout_style = EXCLUDED.layout_style,
    button_style = EXCLUDED.button_style,
    card_style = EXCLUDED.card_style,
    background_pattern = EXCLUDED.background_pattern,
    background_image_url = EXCLUDED.background_image_url,
    theme = EXCLUDED.theme;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER sync_public_profile_trigger
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_public_profile();