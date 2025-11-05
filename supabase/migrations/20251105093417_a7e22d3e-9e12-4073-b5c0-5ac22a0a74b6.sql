-- Fix the normalize_handle function to have secure search_path
CREATE OR REPLACE FUNCTION normalize_handle()
RETURNS TRIGGER AS $$
BEGIN
  NEW.handle = LOWER(NEW.handle);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;