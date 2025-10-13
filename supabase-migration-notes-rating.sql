-- Migration to add notes and rating columns to recipes table
-- Run this SQL in your Supabase SQL Editor

-- Add notes column (text field for user notes)
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add rating column (integer 1-5 for star rating)
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Create index for rating for potential future sorting/filtering
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes(rating DESC);

-- Example queries for testing:

-- Update a recipe with notes and rating
-- UPDATE recipes SET notes = 'This recipe was amazing!', rating = 5 WHERE id = 'your-recipe-id';

-- Get all recipes with ratings
-- SELECT * FROM recipes WHERE rating IS NOT NULL ORDER BY rating DESC;

-- Get recipes with specific rating
-- SELECT * FROM recipes WHERE rating = 5;

-- Get average rating per category
-- SELECT category, AVG(rating) as avg_rating FROM recipes WHERE rating IS NOT NULL GROUP BY category;
