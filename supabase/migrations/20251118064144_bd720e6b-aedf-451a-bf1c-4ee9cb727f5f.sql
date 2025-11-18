-- Allow anyone to insert into beta_whitelist (for waitlist signups)
DROP POLICY IF EXISTS "Service role can manage whitelist" ON beta_whitelist;

-- Anyone can sign up for the waitlist
CREATE POLICY "Anyone can join waitlist"
ON beta_whitelist
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only service role can view/update/delete
CREATE POLICY "Service role can manage whitelist"
ON beta_whitelist
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);