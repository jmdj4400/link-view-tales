-- Add scheduling fields to links table
ALTER TABLE public.links 
ADD COLUMN active_from timestamp with time zone,
ADD COLUMN active_until timestamp with time zone;

-- Add index for efficient schedule queries
CREATE INDEX idx_links_schedule ON public.links(user_id, active_from, active_until) WHERE is_active = true;

-- Add comment for clarity
COMMENT ON COLUMN public.links.active_from IS 'Link becomes active at this time (null = active immediately)';
COMMENT ON COLUMN public.links.active_until IS 'Link becomes inactive after this time (null = never expires)';