-- Drop the existing view
DROP VIEW IF EXISTS public_profiles CASCADE;

-- Create actual table for public profiles
CREATE TABLE public_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  handle text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  primary_color text,
  secondary_color text,
  background_color text,
  text_color text,
  accent_color text,
  heading_font text,
  body_font text,
  layout_style text,
  button_style text,
  card_style text,
  background_pattern text,
  background_image_url text,
  theme text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view public profiles (this is the key!)
CREATE POLICY "Public profiles are viewable by everyone"
ON public_profiles
FOR SELECT
USING (true);

-- Create function to sync profiles → public_profiles
CREATE OR REPLACE FUNCTION sync_public_profile()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql
SET search_path = public;

-- Create trigger to keep public_profiles in sync
CREATE TRIGGER sync_public_profile_trigger
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_public_profile();

-- Populate with existing data
INSERT INTO public_profiles (
  id, name, handle, bio, avatar_url, primary_color, secondary_color,
  background_color, text_color, accent_color, heading_font, body_font,
  layout_style, button_style, card_style, background_pattern,
  background_image_url, theme, created_at
)
SELECT 
  id, name, handle, bio, avatar_url, primary_color, secondary_color,
  background_color, text_color, accent_color, heading_font, body_font,
  layout_style, button_style, card_style, background_pattern,
  background_image_url, theme, created_at
FROM profiles
ON CONFLICT (id) DO NOTHING;