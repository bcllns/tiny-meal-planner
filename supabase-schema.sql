-- Supabase Table Schema for Meal Planner Application
-- Run this SQL in your Supabase SQL Editor to create the recipes table

-- Create recipes table
CREATE TABLE recipes (
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
  user_id UUID, -- Optional: for user-specific recipes if you add authentication
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_recipes_meal_id ON recipes(meal_id);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read recipes
-- Adjust these policies based on your authentication requirements
CREATE POLICY "Allow public read access" ON recipes
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert recipes
-- In production, you might want to restrict this to authenticated users
CREATE POLICY "Allow public insert access" ON recipes
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to delete their own recipes
-- This will work once you add authentication (auth.uid() will be the user's ID)
CREATE POLICY "Allow users to delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: Create policy to allow users to update their own recipes
CREATE POLICY "Allow users to update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Example queries for testing:

-- Get all recipes
-- SELECT * FROM recipes ORDER BY created_at DESC;

-- Get recipes by category
-- SELECT * FROM recipes WHERE category = 'breakfast';

-- Get recipes by meal_id
-- SELECT * FROM recipes WHERE meal_id = 'some-meal-id';

-- Count recipes by category
-- SELECT category, COUNT(*) as count FROM recipes GROUP BY category;
