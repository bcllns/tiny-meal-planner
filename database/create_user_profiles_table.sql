-- Complete User Profiles Table Setup
-- Run this in your Supabase SQL Editor

-- Create the user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_used BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT NULL,
  subscription_id TEXT DEFAULT NULL,
  stripe_customer_id TEXT DEFAULT NULL,
  subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;

-- Create RLS policies
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Allow authenticated users to insert their own profile (for signup)
-- This is more permissive to handle the signup flow where auth.uid() might not be immediately available
CREATE POLICY "Enable insert for authenticated users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information including subscription details';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users(id) - unique identifier for the user';
COMMENT ON COLUMN user_profiles.email IS 'User email address';
COMMENT ON COLUMN user_profiles.full_name IS 'User full name';
COMMENT ON COLUMN user_profiles.trial_used IS 'Whether the user has used their free trial (one free meal plan generation)';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Stripe subscription status: active, canceled, past_due, etc.';
COMMENT ON COLUMN user_profiles.subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN user_profiles.subscription_end_date IS 'Date when the subscription ends (for annual subscriptions)';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
