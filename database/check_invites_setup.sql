-- Quick diagnostic query to check invite system setup
-- Run this in your Supabase SQL Editor

-- 1. Check if invites table exists
SELECT 'invites table exists' AS check_name,
       EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'invites'
       ) AS result;

-- 2. Check if RLS is enabled
SELECT 'RLS enabled' AS check_name,
       relrowsecurity AS result
FROM pg_class
WHERE relname = 'invites';

-- 3. Count RLS policies
SELECT 'RLS policies count' AS check_name,
       COUNT(*) AS result
FROM pg_policies
WHERE tablename = 'invites';

-- 4. Check if helper functions exist
SELECT 'generate_invite_id function exists' AS check_name,
       EXISTS (
         SELECT FROM pg_proc 
         WHERE proname = 'generate_invite_id'
       ) AS result;

SELECT 'set_invite_id function exists' AS check_name,
       EXISTS (
         SELECT FROM pg_proc 
         WHERE proname = 'set_invite_id'
       ) AS result;

SELECT 'mark_invite_accepted function exists' AS check_name,
       EXISTS (
         SELECT FROM pg_proc 
         WHERE proname = 'mark_invite_accepted'
       ) AS result;

-- 5. Check if trigger exists
SELECT 'generate_invites_invite_id trigger exists' AS check_name,
       EXISTS (
         SELECT FROM pg_trigger 
         WHERE tgname = 'generate_invites_invite_id'
       ) AS result;

-- Expected results:
-- All checks should return TRUE
-- RLS policies count should be 4 (SELECT, INSERT, UPDATE, DELETE)
