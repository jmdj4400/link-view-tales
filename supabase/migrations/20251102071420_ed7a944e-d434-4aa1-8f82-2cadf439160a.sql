-- Fix search_path for grant_trial function
CREATE OR REPLACE FUNCTION grant_trial(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update subscriptions table
  UPDATE subscriptions
  SET 
    trial_granted = true,
    trial_end_date = NOW() + INTERVAL '30 days',
    status = 'trialing'
  WHERE user_id = p_user_id;

  -- Update profiles table to reflect pro_trial plan
  UPDATE profiles
  SET plan = 'pro'
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;