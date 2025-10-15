-- Create not_interested table for tracking recipes users are not interested in
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE not_interested (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_not_interested_user_id ON not_interested(user_id);
CREATE INDEX idx_not_interested_meal_id ON not_interested(meal_id);
CREATE INDEX idx_not_interested_user_meal ON not_interested(user_id, meal_id);

-- Enable Row Level Security (RLS)
ALTER TABLE not_interested ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own not interested recipes
CREATE POLICY "Users can view own not interested recipes" ON not_interested
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own not interested recipes
CREATE POLICY "Users can add own not interested recipes" ON not_interested
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own not interested recipes
CREATE POLICY "Users can delete own not interested recipes" ON not_interested
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: Prevent duplicate entries (same user marking same meal as not interested multiple times)
CREATE UNIQUE INDEX idx_not_interested_user_meal_unique ON not_interested(user_id, meal_id);

-- Example queries for testing:

-- Get all not interested recipes for a user
-- SELECT * FROM not_interested WHERE user_id = auth.uid() ORDER BY created_at DESC;

-- Check if a specific recipe is marked as not interested
-- SELECT EXISTS(SELECT 1 FROM not_interested WHERE user_id = auth.uid() AND meal_id = 'some-meal-id');

-- Remove a recipe from not interested
-- DELETE FROM not_interested WHERE user_id = auth.uid() AND meal_id = 'some-meal-id';

-- Count not interested recipes by user
-- SELECT user_id, COUNT(*) as count FROM not_interested GROUP BY user_id;
