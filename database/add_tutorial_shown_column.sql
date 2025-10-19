-- Add tutorial_shown column to user_profiles table
-- Run this in your Supabase SQL Editor

-- Add the new column for tutorial tracking
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS tutorial_shown BOOLEAN DEFAULT FALSE;

-- Add the new column for meal plan generation count
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS meal_plans_generated INTEGER DEFAULT 0;

-- Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_tutorial_shown ON user_profiles(tutorial_shown);
CREATE INDEX IF NOT EXISTS idx_user_profiles_meal_plans_generated ON user_profiles(meal_plans_generated);

-- Comments for documentation
COMMENT ON COLUMN user_profiles.tutorial_shown IS 'Tracks whether the user has seen the tutorial dialog on their first dashboard visit';
COMMENT ON COLUMN user_profiles.meal_plans_generated IS 'Tracks the number of meal plans the user has generated (free limit is 2 before subscription required)';
