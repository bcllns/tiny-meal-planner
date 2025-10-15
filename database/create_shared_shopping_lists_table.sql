-- Create shared_shopping_lists table
-- This table stores shared shopping lists that can be viewed by non-logged-in users

CREATE TABLE IF NOT EXISTS public.shared_shopping_lists (
  -- Primary key: unique identifier for the shared list
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User who created the share
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Consolidated ingredients from OpenAI (what users want to share)
  -- Array of ConsolidatedIngredient objects with category and items
  consolidated_ingredients JSONB NOT NULL,
  
  -- Number of servings total (optional metadata)
  total_servings INTEGER DEFAULT 0,
  
  -- Timestamp for tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional expiration (could be used for auto-cleanup)
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create index on user_id for faster lookups of user's shares
CREATE INDEX idx_shared_shopping_lists_user_id ON public.shared_shopping_lists(user_id);

-- Create index on created_at for potential sorting/filtering
CREATE INDEX idx_shared_shopping_lists_created_at ON public.shared_shopping_lists(created_at);

-- Create index on expires_at for cleanup queries
CREATE INDEX idx_shared_shopping_lists_expires_at ON public.shared_shopping_lists(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.shared_shopping_lists ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view shared shopping lists (even non-authenticated users)
CREATE POLICY "Anyone can view shared shopping lists"
  ON public.shared_shopping_lists
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can create their own shares
CREATE POLICY "Users can create own shared shopping lists"
  ON public.shared_shopping_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own shares (e.g., to extend expiration)
CREATE POLICY "Users can update own shared shopping lists"
  ON public.shared_shopping_lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own shares
CREATE POLICY "Users can delete own shared shopping lists"
  ON public.shared_shopping_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Function to clean up expired shares (run via cron job or manually)
CREATE OR REPLACE FUNCTION cleanup_expired_shared_shopping_lists()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.shared_shopping_lists
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
