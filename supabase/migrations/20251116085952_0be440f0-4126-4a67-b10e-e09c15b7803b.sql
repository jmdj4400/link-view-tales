-- Fix security definer views by enabling security_invoker mode
-- This ensures views respect RLS policies and run with querying user's permissions

-- Drop and recreate public_links_view with security_invoker
DROP VIEW IF EXISTS public_links_view;

CREATE VIEW public_links_view
WITH (security_invoker=on)
AS
SELECT 
  l.id,
  l.user_id,
  l.title,
  l.dest_url,
  l.position,
  l.is_active,
  l.category_id
FROM links l
WHERE l.is_active = true;

GRANT SELECT ON public_links_view TO anon, authenticated;

-- Drop and recreate public_lead_forms_view with security_invoker
DROP VIEW IF EXISTS public_lead_forms_view;

CREATE VIEW public_lead_forms_view
WITH (security_invoker=on)
AS
SELECT 
  lf.id,
  lf.user_id,
  lf.name,
  lf.title,
  lf.description,
  lf.button_text,
  lf.success_message,
  lf.collect_name,
  lf.collect_phone,
  lf.collect_message,
  lf.custom_fields,
  lf.redirect_url,
  lf.is_active
FROM lead_forms lf
WHERE lf.is_active = true;

GRANT SELECT ON public_lead_forms_view TO anon, authenticated;

-- Re-add comments
COMMENT ON VIEW public_links_view IS 'Public view of links with only safe fields exposed for profile pages. Runs with security_invoker to respect RLS.';
COMMENT ON VIEW public_lead_forms_view IS 'Public view of lead forms with only necessary fields for form rendering. Runs with security_invoker to respect RLS.';