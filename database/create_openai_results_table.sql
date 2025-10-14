-- Create openai_results table for storing AI-generated meal plans
-- Run this SQL in your Supabase SQL Editor
-- This table stores all meals returned from OpenAI for tracking and analytics

CREATE TABLE openai_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL,
  prep_time TEXT,
  cook_time TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  category TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_openai_results_meal_id ON openai_results(meal_id);
CREATE INDEX idx_openai_results_user_id ON openai_results(user_id);
CREATE INDEX idx_openai_results_category ON openai_results(category);
CREATE INDEX idx_openai_results_created_at ON openai_results(created_at DESC);
CREATE INDEX idx_openai_results_user_created ON openai_results(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE openai_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own OpenAI results
CREATE POLICY "Users can view own openai results" ON openai_results
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own OpenAI results
CREATE POLICY "Users can insert own openai results" ON openai_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own OpenAI results
CREATE POLICY "Users can delete own openai results" ON openai_results
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policy: Users can only update their own OpenAI results
CREATE POLICY "Users can update own openai results" ON openai_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
-- Reuse the existing function if it was created with recipes table
-- If not, uncomment the following:
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_openai_results_updated_at
  BEFORE UPDATE ON openai_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Example queries for testing:

-- Get all OpenAI results for current user
-- SELECT * FROM openai_results WHERE user_id = auth.uid() ORDER BY created_at DESC;

-- Get OpenAI results by category for current user
-- SELECT * FROM openai_results WHERE user_id = auth.uid() AND category = 'breakfast';

-- Count OpenAI results per user
-- SELECT user_id, COUNT(*) as total_results FROM openai_results GROUP BY user_id;

-- Get recent meal plans (grouped by creation date)
-- SELECT DATE(created_at) as plan_date, COUNT(*) as meals_count 
-- FROM openai_results 
-- WHERE user_id = auth.uid() 
-- GROUP BY DATE(created_at) 
-- ORDER BY plan_date DESC;

-- Get most frequently generated meal names
-- SELECT name, COUNT(*) as frequency 
-- FROM openai_results 
-- WHERE user_id = auth.uid() 
-- GROUP BY name 
-- ORDER BY frequency DESC 
-- LIMIT 10;
