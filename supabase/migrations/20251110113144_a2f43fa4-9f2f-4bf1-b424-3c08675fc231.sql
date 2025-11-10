-- Fix Critical Security Issues from Audit

-- 1. CRITICAL: Restrict links table - users can only see their own links
DROP POLICY IF EXISTS "Enable read access for all users" ON links;
CREATE POLICY "Users can view their own links" 
  ON links FOR SELECT 
  USING (auth.uid() = user_id);

-- 2. CRITICAL: Restrict scorecards table - users can only see their own scorecards
DROP POLICY IF EXISTS "Enable read access for all users" ON scorecards;
CREATE POLICY "Users can view their own scorecards" 
  ON scorecards FOR SELECT 
  USING (auth.uid() = user_id);

-- 3. CRITICAL: Restrict incidents table - admin only access
DROP POLICY IF EXISTS "Enable read access for all users" ON incidents;
CREATE POLICY "Admins can view all incidents" 
  ON incidents FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. WARNING: Restrict rate_limits table - users can only see their own rate limits
DROP POLICY IF EXISTS "Enable read access for all users" ON rate_limits;
CREATE POLICY "Users can view their own rate limits" 
  ON rate_limits FOR SELECT 
  USING (auth.uid()::text = identifier);

-- 5. WARNING: Add UPDATE policy to leads table
CREATE POLICY "Users can update their own leads" 
  ON leads FOR UPDATE 
  USING (auth.uid() = user_id);

-- Note: public_profiles is intentionally public (link-in-bio service)
-- Extension in public schema warning is acceptable for this project