-- Create invites table for tracking referral invitations
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_id TEXT UNIQUE NOT NULL, -- Unique ID for tracking sign-ups from this invite
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User who sent the invite
  email TEXT NOT NULL, -- Email address of invitee
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')), -- Invite status
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who accepted the invite
  accepted_at TIMESTAMP WITH TIME ZONE, -- When the invite was accepted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_invites_invite_id ON invites(invite_id);
CREATE INDEX idx_invites_invited_by ON invites(invited_by);
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_created_at ON invites(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own sent invites
CREATE POLICY "Users can view own sent invites" ON invites
  FOR SELECT USING (auth.uid() = invited_by);

-- RLS Policy: Authenticated users can insert invites
CREATE POLICY "Authenticated users can send invites" ON invites
  FOR INSERT WITH CHECK (auth.uid() = invited_by);

-- RLS Policy: Users can only update their own sent invites
CREATE POLICY "Users can update own sent invites" ON invites
  FOR UPDATE USING (auth.uid() = invited_by);

-- RLS Policy: Users can only delete their own sent invites
CREATE POLICY "Users can delete own sent invites" ON invites
  FOR DELETE USING (auth.uid() = invited_by);

-- Create a function to automatically update the updated_at timestamp
-- Reuse the existing function if it was created with other tables
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
CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate a unique invite ID
CREATE OR REPLACE FUNCTION generate_invite_id()
RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  new_invite_id TEXT := '';
  i INTEGER;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 10-character random string
    new_invite_id := '';
    FOR i IN 1..10 LOOP
      new_invite_id := new_invite_id || substr(characters, floor(random() * length(characters) + 1)::int, 1);
    END LOOP;
    
    -- Check if this ID already exists
    SELECT EXISTS(SELECT 1 FROM invites WHERE invite_id = new_invite_id) INTO id_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_invite_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate invite_id before insert
CREATE OR REPLACE FUNCTION set_invite_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_id IS NULL OR NEW.invite_id = '' THEN
    NEW.invite_id := generate_invite_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invites_invite_id
  BEFORE INSERT ON invites
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_id();

-- Create a function to mark an invite as accepted
CREATE OR REPLACE FUNCTION mark_invite_accepted(invite_id_param TEXT, user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE invites 
  SET 
    status = 'accepted',
    accepted_by = user_id_param,
    accepted_at = NOW()
  WHERE invite_id = invite_id_param AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Example queries for testing:

-- Get all invites sent by a user
-- SELECT * FROM invites WHERE invited_by = auth.uid() ORDER BY created_at DESC;

-- Get invite by invite_id (for sign-up link tracking)
-- SELECT * FROM invites WHERE invite_id = 'abc1234567';

-- Get invite statistics for a user
-- SELECT 
--   COUNT(*) as total_sent,
--   COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
--   COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
-- FROM invites 
-- WHERE invited_by = auth.uid();

-- Mark an invite as accepted (called during sign-up with invite_id parameter)
-- SELECT mark_invite_accepted('abc1234567', '<new_user_uuid>');

-- Get leaderboard of users who sent most invites
-- SELECT invited_by, COUNT(*) as invite_count, 
--        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count
-- FROM invites 
-- GROUP BY invited_by 
-- ORDER BY accepted_count DESC, invite_count DESC
-- LIMIT 10;

-- Clean up old pending invites (e.g., older than 90 days)
-- UPDATE invites 
-- SET status = 'expired' 
-- WHERE status = 'pending' AND created_at < NOW() - INTERVAL '90 days';
