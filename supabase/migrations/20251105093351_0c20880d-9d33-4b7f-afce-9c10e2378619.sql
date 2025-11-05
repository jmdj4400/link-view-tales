-- Normalize existing handles to lowercase
UPDATE profiles SET handle = LOWER(handle);

-- Create a function to ensure handles are always lowercase
CREATE OR REPLACE FUNCTION normalize_handle()
RETURNS TRIGGER AS $$
BEGIN
  NEW.handle = LOWER(NEW.handle);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to normalize handles on insert and update
DROP TRIGGER IF EXISTS normalize_handle_trigger ON profiles;
CREATE TRIGGER normalize_handle_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION normalize_handle();