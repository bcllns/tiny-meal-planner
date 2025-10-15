# 🔧 User Profile Creation Troubleshooting

## Problem: User created in auth table but not in user_profiles table

This guide will help you fix the issue where users are created in Supabase Auth but their profile record is not being created in the `user_profiles` table.

## Quick Fix (Follow These Steps)

### Step 1: Run the Complete Table Setup

Go to **Supabase Dashboard → SQL Editor** and run this file:

```
database/create_user_profiles_table.sql
```

This will:

- ✅ Create the `user_profiles` table (if it doesn't exist)
- ✅ Set up proper columns with correct data types
- ✅ Enable Row Level Security (RLS)
- ✅ Create policies allowing users to insert their own profiles
- ✅ Add indexes for performance

### Step 2: Verify Table Exists

In Supabase:

1. Go to **Table Editor**
2. You should see `user_profiles` table
3. Click on it to view structure
4. Verify these columns exist:
   - `id` (uuid, primary key)
   - `user_id` (uuid, unique, references auth.users)
   - `email` (text)
   - `full_name` (text)
   - `created_at` (timestamp)
   - `trial_used` (boolean, default: false)
   - `subscription_status` (text, nullable)
   - `subscription_id` (text, nullable)
   - `stripe_customer_id` (text, nullable)
   - `subscription_end_date` (timestamp, nullable)

### Step 3: Check RLS Policies

In Supabase:

1. Go to **Authentication → Policies**
2. Select `user_profiles` table
3. You should see 3 policies:
   - ✅ "Users can view their own profile" (SELECT)
   - ✅ "Users can insert their own profile" (INSERT)
   - ✅ "Users can update their own profile" (UPDATE)

### Step 4: Test Signup

1. Clear browser cache/local storage
2. Go to your app
3. Sign up with a new email
4. Open browser console (F12)
5. Look for log messages:
   ```
   Creating user profile for: [user-id] [email]
   User profile created successfully
   ```
6. Go to Supabase → Table Editor → user_profiles
7. ✅ You should see the new user's profile

## Common Issues & Solutions

### Issue 1: "relation 'user_profiles' does not exist"

**Problem:** Table hasn't been created

**Solution:**

```sql
-- Run this in Supabase SQL Editor
-- File: database/create_user_profiles_table.sql
```

### Issue 2: "new row violates row-level security policy"

**Problem:** RLS is enabled but policies don't allow INSERT

**Solution:**

```sql
-- Run this in Supabase SQL Editor
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Issue 3: "duplicate key value violates unique constraint"

**Problem:** User profile already exists

**Solution:**
This is actually fine! It means the profile was created. The app handles this gracefully.

### Issue 4: "column 'trial_used' does not exist"

**Problem:** Table exists but missing new columns

**Solution:**

```sql
-- Run this in Supabase SQL Editor
-- File: database/add_subscription_fields.sql
```

### Issue 5: Profile created but trial_used is NULL

**Problem:** Column exists but no default value

**Solution:**

```sql
-- Set default and update existing records
ALTER TABLE user_profiles
ALTER COLUMN trial_used SET DEFAULT false;

UPDATE user_profiles
SET trial_used = false
WHERE trial_used IS NULL;
```

## Debugging Steps

### Check Browser Console

Open DevTools (F12) during signup and look for:

**✅ Success:**

```
Creating user profile for: abc-123 user@example.com
User profile created successfully
```

**❌ Error:**

```
Error creating user profile: {...}
Profile error details: {
  code: "42P01",
  message: "relation 'user_profiles' does not exist"
}
```

### Check Supabase Logs

1. Go to Supabase Dashboard → **Logs** → **API Logs**
2. Filter for `user_profiles`
3. Look for INSERT errors
4. Common error codes:
   - `42P01` - Table doesn't exist
   - `42501` - RLS policy violation
   - `23505` - Duplicate key (profile exists)

### Manual Profile Creation Test

Test if you can manually insert a profile:

```sql
-- Get a user ID from auth.users
SELECT id, email FROM auth.users LIMIT 1;

-- Try to insert a profile (replace USER_ID with actual ID)
INSERT INTO user_profiles (user_id, email, full_name, trial_used)
VALUES ('USER_ID', 'test@example.com', 'Test User', false);
```

If this fails, check:

- RLS policies
- Column names/types
- Foreign key constraints

## Step-by-Step Setup from Scratch

If you're starting fresh or having persistent issues:

### 1. Create Table

```sql
-- Run: database/create_user_profiles_table.sql
```

### 2. Verify Table Structure

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

### 3. Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';
-- rowsecurity should be 't' (true)
```

### 4. List RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_profiles';
```

### 5. Test Insert with Current User

```sql
-- This should work when logged in
INSERT INTO user_profiles (user_id, email, full_name, trial_used)
VALUES (auth.uid(), auth.email(), 'Test', false);
```

## Migration Checklist

- [ ] Run `create_user_profiles_table.sql`
- [ ] Verify table exists in Supabase Table Editor
- [ ] Verify RLS is enabled
- [ ] Verify INSERT policy exists
- [ ] Test signup with new email
- [ ] Check browser console for logs
- [ ] Verify profile appears in Supabase
- [ ] Test that trial works (1 free meal plan)

## Still Having Issues?

### Check These Files:

1. **Database Migration:**

   - `database/create_user_profiles_table.sql` - Creates table & policies

2. **Code Implementation:**

   - `src/lib/auth.ts` - Line 77-100 (signUp function)
   - Check console logs during signup

3. **Supabase Settings:**
   - Table Editor → user_profiles (table exists?)
   - Authentication → Policies (policies exist?)
   - Logs → API (any errors?)

### Get More Info:

Add this to your signup test:

```javascript
// In browser console after signup attempt
console.log("Auth user created:", localStorage.getItem("supabase.auth.token"));
```

Then check Supabase Table Editor to see if profile exists.

## Expected Behavior

**✅ Success Flow:**

1. User fills signup form
2. Supabase creates auth record
3. App inserts user_profiles record
4. Console logs: "User profile created successfully"
5. User can log in
6. User sees dashboard
7. User can generate 1 free meal plan (trial)

**❌ Partial Success (Profile Creation Failed):**

1. User fills signup form
2. Supabase creates auth record
3. App tries to insert profile → fails
4. Console logs error details
5. User can still log in
6. Profile auto-created on first login
7. User still gets free trial

## Contact Points

If still stuck, check:

- Browser console errors
- Supabase API logs
- Network tab (see the actual API request/response)
- Supabase table editor (is the table structure correct?)

---

**Most Common Fix:** Run `database/create_user_profiles_table.sql` in Supabase SQL Editor
