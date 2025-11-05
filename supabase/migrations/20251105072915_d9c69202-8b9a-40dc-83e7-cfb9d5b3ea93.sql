-- Create link categories table
CREATE TABLE public.link_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on link_categories
ALTER TABLE public.link_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for link_categories
CREATE POLICY "Users can view own categories"
  ON public.link_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.link_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.link_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.link_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Add category_id to links table
ALTER TABLE public.links ADD COLUMN category_id UUID REFERENCES public.link_categories(id) ON DELETE SET NULL;

-- Create link variants table for A/B testing
CREATE TABLE public.link_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dest_url TEXT NOT NULL,
  traffic_percentage INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT traffic_percentage_range CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100)
);

-- Enable RLS on link_variants
ALTER TABLE public.link_variants ENABLE ROW LEVEL SECURITY;

-- RLS policies for link_variants
CREATE POLICY "Users can view variants of own links"
  ON public.link_variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.links
    WHERE links.id = link_variants.link_id
    AND links.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert variants for own links"
  ON public.link_variants FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.links
    WHERE links.id = link_variants.link_id
    AND links.user_id = auth.uid()
  ));

CREATE POLICY "Users can update variants of own links"
  ON public.link_variants FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.links
    WHERE links.id = link_variants.link_id
    AND links.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete variants of own links"
  ON public.link_variants FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.links
    WHERE links.id = link_variants.link_id
    AND links.user_id = auth.uid()
  ));

-- Add variant_id to events for A/B testing tracking
ALTER TABLE public.events ADD COLUMN variant_id UUID REFERENCES public.link_variants(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_links_category_id ON public.links(category_id);
CREATE INDEX idx_link_variants_link_id ON public.link_variants(link_id);
CREATE INDEX idx_events_variant_id ON public.events(variant_id);

-- Add trigger for link_categories updated_at
CREATE TRIGGER update_link_categories_updated_at
  BEFORE UPDATE ON public.link_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for link_variants updated_at
CREATE TRIGGER update_link_variants_updated_at
  BEFORE UPDATE ON public.link_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();