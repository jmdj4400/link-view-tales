-- Remove public read access to scorecards table
-- The "Users can view their own scorecards" policy already provides proper owner-scoped access
DROP POLICY IF EXISTS "Scorecards are publicly readable" ON scorecards;