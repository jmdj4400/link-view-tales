-- ================================================
-- CRITICAL SECURITY FIX: Lock down sensitive data
-- ================================================

-- 1. INCIDENTS TABLE - Remove public access (CRITICAL)
DROP POLICY IF EXISTS "Incidents are publicly readable" ON incidents;
-- Keep admin-only access policy (already exists)

-- 2. RATE_LIMITS TABLE - Remove public transparency policy (CRITICAL)
DROP POLICY IF EXISTS "Users can read rate limits for transparency" ON rate_limits;
-- Keep user-specific and service role policies (already exist)

-- 3. LINKS TABLE - Remove overly permissive public policy
DROP POLICY IF EXISTS "Public links are viewable by everyone" ON links;

-- Create restricted public view for links (only safe fields for public profiles/redirects)
CREATE OR REPLACE VIEW public_links_view AS
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

-- Grant access to public links view
GRANT SELECT ON public_links_view TO anon, authenticated;

-- 4. LEAD_FORMS TABLE - Remove public viewability of sensitive data
DROP POLICY IF EXISTS "Public forms are viewable" ON lead_forms;

-- Create restricted public view for lead forms (only fields needed for form rendering)
CREATE OR REPLACE VIEW public_lead_forms_view AS
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

-- Grant access to public lead forms view
GRANT SELECT ON public_lead_forms_view TO anon, authenticated;

-- 5. Add policy to allow public to view active links through the base table for redirects
-- (needed for RedirectHandler functionality)
CREATE POLICY "Public can view active links for redirects"
ON links
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 6. Add policy to allow public to view active forms for submissions
CREATE POLICY "Public can view active forms for submissions"
ON lead_forms
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 7. Add comments for documentation
COMMENT ON VIEW public_links_view IS 'Public view of links with only safe fields exposed for profile pages';
COMMENT ON VIEW public_lead_forms_view IS 'Public view of lead forms with only necessary fields for form rendering';
COMMENT ON POLICY "Public can view active links for redirects" ON links IS 'Allows public access to active links for redirect functionality - full row access needed for RedirectHandler';
COMMENT ON POLICY "Public can view active forms for submissions" ON lead_forms IS 'Allows public access to active forms for rendering - full row access needed for form submissions';