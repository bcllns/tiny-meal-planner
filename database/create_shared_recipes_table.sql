-- Create shared_recipes table for publicly shareable recipe links
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE shared_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT UNIQUE NOT NULL, -- Short, unique ID for the shareable URL
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL, -- Optional reference to saved recipe
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL,
  prep_time TEXT,
  cook_time TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  category TEXT NOT NULL,
  shared_by_name TEXT, -- Name of the person sharing (optional)
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_shared_recipes_share_id ON shared_recipes(share_id);
CREATE INDEX idx_shared_recipes_user_id ON shared_recipes(user_id);
CREATE INDEX idx_shared_recipes_recipe_id ON shared_recipes(recipe_id);
CREATE INDEX idx_shared_recipes_created_at ON shared_recipes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE shared_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read shared recipes (they're meant to be public)
CREATE POLICY "Anyone can view shared recipes" ON shared_recipes
  FOR SELECT USING (true);

-- RLS Policy: Authenticated users can insert shared recipes
CREATE POLICY "Authenticated users can share recipes" ON shared_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own shared recipes
CREATE POLICY "Users can update own shared recipes" ON shared_recipes
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own shared recipes
CREATE POLICY "Users can delete own shared recipes" ON shared_recipes
  FOR DELETE USING (auth.uid() = user_id);

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
CREATE TRIGGER update_shared_recipes_updated_at
  BEFORE UPDATE ON shared_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate a unique short share ID
CREATE OR REPLACE FUNCTION generate_share_id()
RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  new_share_id TEXT := '';
  i INTEGER;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character random string
    new_share_id := '';
    FOR i IN 1..8 LOOP
      new_share_id := new_share_id || substr(characters, floor(random() * length(characters) + 1)::int, 1);
    END LOOP;
    
    -- Check if this ID already exists
    SELECT EXISTS(SELECT 1 FROM shared_recipes WHERE share_id = new_share_id) INTO id_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_share_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION increment_share_view_count(share_id_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE shared_recipes 
  SET view_count = view_count + 1 
  WHERE share_id = share_id_param;
END;
$$ LANGUAGE plpgsql;

-- Example queries for testing:

-- Get a shared recipe by share_id
-- SELECT * FROM shared_recipes WHERE share_id = 'abc12345';

-- Get all shared recipes by a user
-- SELECT * FROM shared_recipes WHERE user_id = auth.uid() ORDER BY created_at DESC;

-- Get most viewed shared recipes
-- SELECT name, view_count, shared_by_name, created_at 
-- FROM shared_recipes 
-- ORDER BY view_count DESC 
-- LIMIT 10;

-- Delete old shared recipes (e.g., older than 90 days)
-- DELETE FROM shared_recipes WHERE created_at < NOW() - INTERVAL '90 days';

-- Count shared recipes per user
-- SELECT user_id, COUNT(*) as share_count 
-- FROM shared_recipes 
-- GROUP BY user_id 
-- ORDER BY share_count DESC;
