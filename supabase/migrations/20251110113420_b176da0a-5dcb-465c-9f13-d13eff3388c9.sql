-- Add stripe_price_id to subscriptions table to track which plan (Pro $9 vs Business $29)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_price_id 
ON subscriptions(stripe_price_id);

-- Add comment to clarify usage
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe price ID to distinguish between Pro ($9) and Business ($29) plans';