-- Migration: Add trial_start_date column to user_profiles table
-- This tracks when the user's 7-day trial started

-- Add the trial_start_date column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- For existing users without a trial_start_date, set it to their created_at date
UPDATE user_profiles 
SET trial_start_date = created_at 
WHERE trial_start_date IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.trial_start_date IS 'Date when the user trial period started (7 days from this date)';

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'trial_start_date';
