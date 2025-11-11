-- Fix security: Set search_path for normalize_slug function
CREATE OR REPLACE FUNCTION normalize_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.slug = LOWER(REGEXP_REPLACE(NEW.slug, '[^a-zA-Z0-9-]', '-', 'g'));
  NEW.slug = REGEXP_REPLACE(NEW.slug, '-+', '-', 'g');
  NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
  RETURN NEW;
END;
$$;