-- Create articles table for blog/analysis content
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  featured_image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Anyone can view published articles"
ON public.articles FOR SELECT
USING (published = true);

-- Authenticated users can create articles
CREATE POLICY "Authenticated users can create articles"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles
CREATE POLICY "Authors can update their own articles"
ON public.articles FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own articles
CREATE POLICY "Authors can delete their own articles"
ON public.articles FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Admins can manage all articles
CREATE POLICY "Admins can manage all articles"
ON public.articles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to normalize slug
CREATE OR REPLACE FUNCTION normalize_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug = LOWER(REGEXP_REPLACE(NEW.slug, '[^a-zA-Z0-9-]', '-', 'g'));
  NEW.slug = REGEXP_REPLACE(NEW.slug, '-+', '-', 'g');
  NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_article_slug
BEFORE INSERT OR UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION normalize_slug();

-- Create index for better query performance
CREATE INDEX idx_articles_published ON public.articles(published, published_at DESC);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_articles_tags ON public.articles USING GIN(tags);