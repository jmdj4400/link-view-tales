-- Add click limits and UTM parameters to links table
ALTER TABLE public.links 
ADD COLUMN max_clicks integer,
ADD COLUMN current_clicks integer DEFAULT 0,
ADD COLUMN utm_source text,
ADD COLUMN utm_medium text,
ADD COLUMN utm_campaign text;

-- Add performance indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_events_user_created ON public.events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_link_type ON public.events(link_id, event_type) WHERE link_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_metrics_user_date ON public.metrics_daily(user_id, date DESC);

-- Add function to increment click count
CREATE OR REPLACE FUNCTION increment_link_clicks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment for click events
  IF NEW.event_type = 'click' AND NEW.link_id IS NOT NULL THEN
    UPDATE links 
    SET current_clicks = COALESCE(current_clicks, 0) + 1
    WHERE id = NEW.link_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-increment clicks
DROP TRIGGER IF EXISTS trigger_increment_clicks ON public.events;
CREATE TRIGGER trigger_increment_clicks
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION increment_link_clicks();

-- Add comments for clarity
COMMENT ON COLUMN public.links.max_clicks IS 'Maximum allowed clicks (null = unlimited)';
COMMENT ON COLUMN public.links.current_clicks IS 'Current number of clicks';
COMMENT ON COLUMN public.links.utm_source IS 'UTM source parameter';
COMMENT ON COLUMN public.links.utm_medium IS 'UTM medium parameter';
COMMENT ON COLUMN public.links.utm_campaign IS 'UTM campaign parameter';