-- Create theme_presets table for saving custom themes
CREATE TABLE public.theme_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Colors
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#8b5cf6',
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#10b981',
  
  -- Typography
  heading_font TEXT DEFAULT 'Inter',
  body_font TEXT DEFAULT 'Inter',
  
  -- Layout
  layout_style TEXT DEFAULT 'classic',
  button_style TEXT DEFAULT 'rounded',
  card_style TEXT DEFAULT 'elevated',
  
  -- Additional styling
  background_pattern TEXT,
  background_image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on theme_presets
ALTER TABLE public.theme_presets ENABLE ROW LEVEL SECURITY;

-- RLS policies for theme_presets
CREATE POLICY "Users can view own theme presets"
  ON public.theme_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own theme presets"
  ON public.theme_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own theme presets"
  ON public.theme_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own theme presets"
  ON public.theme_presets FOR DELETE
  USING (auth.uid() = user_id);

-- Add theme customization columns to profiles
ALTER TABLE public.profiles ADD COLUMN active_theme_id UUID REFERENCES public.theme_presets(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN primary_color TEXT DEFAULT '#3b82f6';
ALTER TABLE public.profiles ADD COLUMN secondary_color TEXT DEFAULT '#8b5cf6';
ALTER TABLE public.profiles ADD COLUMN background_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.profiles ADD COLUMN text_color TEXT DEFAULT '#000000';
ALTER TABLE public.profiles ADD COLUMN accent_color TEXT DEFAULT '#10b981';
ALTER TABLE public.profiles ADD COLUMN heading_font TEXT DEFAULT 'Inter';
ALTER TABLE public.profiles ADD COLUMN body_font TEXT DEFAULT 'Inter';
ALTER TABLE public.profiles ADD COLUMN layout_style TEXT DEFAULT 'classic';
ALTER TABLE public.profiles ADD COLUMN button_style TEXT DEFAULT 'rounded';
ALTER TABLE public.profiles ADD COLUMN card_style TEXT DEFAULT 'elevated';
ALTER TABLE public.profiles ADD COLUMN background_pattern TEXT;
ALTER TABLE public.profiles ADD COLUMN background_image_url TEXT;

-- Create index for better query performance
CREATE INDEX idx_theme_presets_user_id ON public.theme_presets(user_id);
CREATE INDEX idx_profiles_active_theme_id ON public.profiles(active_theme_id);

-- Add trigger for theme_presets updated_at
CREATE TRIGGER update_theme_presets_updated_at
  BEFORE UPDATE ON public.theme_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();