-- Add enhanced customization options to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS gradient_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS gradient_from TEXT DEFAULT '#3b82f6',
  ADD COLUMN IF NOT EXISTS gradient_to TEXT DEFAULT '#8b5cf6',
  ADD COLUMN IF NOT EXISTS animation_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS background_blur BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS card_border_width INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS social_icon_style TEXT DEFAULT 'rounded',
  ADD COLUMN IF NOT EXISTS profile_layout TEXT DEFAULT 'classic';

-- Also add to theme_presets table
ALTER TABLE public.theme_presets 
  ADD COLUMN IF NOT EXISTS gradient_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS gradient_from TEXT DEFAULT '#3b82f6',
  ADD COLUMN IF NOT EXISTS gradient_to TEXT DEFAULT '#8b5cf6',
  ADD COLUMN IF NOT EXISTS animation_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS background_blur BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS card_border_width INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS social_icon_style TEXT DEFAULT 'rounded',
  ADD COLUMN IF NOT EXISTS profile_layout TEXT DEFAULT 'classic';