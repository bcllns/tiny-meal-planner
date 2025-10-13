-- Add subscription and trial fields to user_profiles table
-- Run this migration in your Supabase SQL editor

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON user_profiles(subscription_status);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.trial_used IS 'Whether the user has used their free trial (one free meal plan generation)';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Stripe subscription status: active, canceled, past_due, etc.';
COMMENT ON COLUMN user_profiles.subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN user_profiles.subscription_end_date IS 'Date when the subscription ends (for annual subscriptions)';
