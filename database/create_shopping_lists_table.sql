-- Create shopping_lists table
-- This table stores one shopping list per user with recipe data and consolidated ingredients

CREATE TABLE IF NOT EXISTS public.shopping_lists (
  -- Primary key: user_id (enforces one shopping list per user)
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recipe data: array of ShoppingListItem objects
  -- Each item contains: recipeId, recipeName, ingredients[], servings, addedAt
  recipe_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Consolidated ingredients from OpenAI
  -- Array of ConsolidatedIngredient objects with category and items
  consolidated_ingredients JSONB DEFAULT NULL,
  
  -- Timestamp for tracking updates
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups (though it's already the PK)
-- CREATE INDEX idx_shopping_lists_user_id ON public.shopping_lists(user_id);

-- Create index on updated_at for potential sorting/filtering
CREATE INDEX idx_shopping_lists_updated_at ON public.shopping_lists(updated_at);

-- Enable Row Level Security
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own shopping list
CREATE POLICY "Users can view own shopping list"
  ON public.shopping_lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own shopping list
CREATE POLICY "Users can insert own shopping list"
  ON public.shopping_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own shopping list
CREATE POLICY "Users can update own shopping list"
  ON public.shopping_lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own shopping list
CREATE POLICY "Users can delete own shopping list"
  ON public.shopping_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shopping_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_shopping_list_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_list_updated_at();
