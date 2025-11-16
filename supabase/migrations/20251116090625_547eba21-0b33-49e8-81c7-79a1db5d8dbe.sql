-- Add new customization fields to profiles table for advanced animations
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS background_video_url TEXT,
ADD COLUMN IF NOT EXISTS particle_effect VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS text_animation VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS link_animation VARCHAR(50) DEFAULT 'fade',
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS enable_parallax BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_glassmorphism BOOLEAN DEFAULT false;

-- Update public_profiles table to include new fields
ALTER TABLE public.public_profiles
ADD COLUMN IF NOT EXISTS background_video_url TEXT,
ADD COLUMN IF NOT EXISTS particle_effect VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS text_animation VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS link_animation VARCHAR(50) DEFAULT 'fade',
ADD COLUMN IF NOT EXISTS enable_parallax BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_glassmorphism BOOLEAN DEFAULT false;

-- Add new customization fields to theme_presets
ALTER TABLE public.theme_presets
ADD COLUMN IF NOT EXISTS background_video_url TEXT,
ADD COLUMN IF NOT EXISTS particle_effect VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS text_animation VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS link_animation VARCHAR(50) DEFAULT 'fade',
ADD COLUMN IF NOT EXISTS enable_parallax BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_glassmorphism BOOLEAN DEFAULT false;