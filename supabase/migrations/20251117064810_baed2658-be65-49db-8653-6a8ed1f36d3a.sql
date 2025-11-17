-- Add missing columns to public_profiles table
ALTER TABLE public.public_profiles 
ADD COLUMN IF NOT EXISTS profile_layout text,
ADD COLUMN IF NOT EXISTS gradient_enabled boolean,
ADD COLUMN IF NOT EXISTS gradient_from text,
ADD COLUMN IF NOT EXISTS gradient_to text,
ADD COLUMN IF NOT EXISTS animation_enabled boolean,
ADD COLUMN IF NOT EXISTS background_blur boolean,
ADD COLUMN IF NOT EXISTS card_border_width integer;

-- Update existing rows to have default values matching profiles table
UPDATE public.public_profiles
SET 
  gradient_enabled = COALESCE(gradient_enabled, false),
  animation_enabled = COALESCE(animation_enabled, true),
  background_blur = COALESCE(background_blur, false),
  card_border_width = COALESCE(card_border_width, 1);

-- Create trigger to sync public_profiles with profiles for new columns
CREATE OR REPLACE FUNCTION sync_public_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert into public_profiles
  INSERT INTO public.public_profiles (
    id, name, handle, bio, avatar_url, 
    primary_color, secondary_color, background_color, text_color, accent_color,
    heading_font, body_font, layout_style, button_style, card_style,
    background_pattern, background_image_url, background_video_url, theme,
    profile_layout, gradient_enabled, gradient_from, gradient_to,
    animation_enabled, background_blur, card_border_width,
    particle_effect, text_animation, link_animation,
    enable_parallax, enable_glassmorphism, created_at
  )
  VALUES (
    NEW.id, NEW.name, NEW.handle, NEW.bio, NEW.avatar_url,
    NEW.primary_color, NEW.secondary_color, NEW.background_color, NEW.text_color, NEW.accent_color,
    NEW.heading_font, NEW.body_font, NEW.layout_style, NEW.button_style, NEW.card_style,
    NEW.background_pattern, NEW.background_image_url, NEW.background_video_url, NEW.theme,
    NEW.profile_layout, NEW.gradient_enabled, NEW.gradient_from, NEW.gradient_to,
    NEW.animation_enabled, NEW.background_blur, NEW.card_border_width,
    NEW.particle_effect, NEW.text_animation, NEW.link_animation,
    NEW.enable_parallax, NEW.enable_glassmorphism, NEW.created_at
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
    background_video_url = EXCLUDED.background_video_url,
    theme = EXCLUDED.theme,
    profile_layout = EXCLUDED.profile_layout,
    gradient_enabled = EXCLUDED.gradient_enabled,
    gradient_from = EXCLUDED.gradient_from,
    gradient_to = EXCLUDED.gradient_to,
    animation_enabled = EXCLUDED.animation_enabled,
    background_blur = EXCLUDED.background_blur,
    card_border_width = EXCLUDED.card_border_width,
    particle_effect = EXCLUDED.particle_effect,
    text_animation = EXCLUDED.text_animation,
    link_animation = EXCLUDED.link_animation,
    enable_parallax = EXCLUDED.enable_parallax,
    enable_glassmorphism = EXCLUDED.enable_glassmorphism;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS sync_public_profiles_trigger ON public.profiles;
CREATE TRIGGER sync_public_profiles_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_public_profiles();