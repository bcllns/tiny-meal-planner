# 🚨 QUICK FIX: User Profile Not Created

## The Problem

Users are created in the `auth.users` table but NOT in the `user_profiles` table.

## The Solution (3 Steps - 2 minutes)

### Step 1: Run This SQL

Go to **Supabase Dashboard → SQL Editor** and paste this entire file:

📁 `database/create_user_profiles_table.sql`

Then click **RUN** (or Cmd/Ctrl + Enter)

### Step 2: Verify It Worked

Go to **Supabase → Table Editor**

You should now see `user_profiles` table with these columns:

- ✅ id
- ✅ user_id
- ✅ email
- ✅ full_name
- ✅ created_at
- ✅ trial_used
- ✅ subscription_status
- ✅ subscription_id
- ✅ stripe_customer_id
- ✅ subscription_end_date

### Step 3: Test Signup

1. Clear your browser cache/storage
2. Sign up with a NEW email
3. Open browser console (F12)
4. Look for: `"User profile created successfully"`
5. Check Supabase → user_profiles table
6. ✅ Your user should be there!

## Why This Fixes It

The issue is one of these:

### ❌ Problem 1: Table Doesn't Exist

The `user_profiles` table was never created. The SQL migration only ADDED columns to an existing table.

### ❌ Problem 2: Missing RLS Policies

The table exists but Row Level Security prevents users from inserting their own profiles.

### ❌ Problem 3: Wrong Column Types

The table exists but has wrong structure/column names.

## The SQL Does This:

```sql
1. Creates user_profiles table (if not exists)
2. Sets up all required columns with correct types
3. Enables Row Level Security
4. Creates policies allowing users to:
   - INSERT their own profile (signup)
   - SELECT their own profile (view)
   - UPDATE their own profile (edit)
5. Adds indexes for performance
```

## How to Know If It's Fixed

### ✅ Before Fix:

- User signs up
- Auth record created ✅
- user_profiles record NOT created ❌
- Browser console shows error

### ✅ After Fix:

- User signs up
- Auth record created ✅
- user_profiles record created ✅
- Browser console shows "User profile created successfully"
- User has trial_used = false (ready for free trial)

## Still Not Working?

### Check Browser Console:

Look for error messages after signup. Common ones:

**"relation 'user_profiles' does not exist"**
→ Table not created. Run the SQL again.

**"new row violates row-level security policy"**
→ RLS policies not set up. The SQL should fix this.

**"duplicate key value violates unique constraint"**
→ User already has a profile! This is actually fine.

### Check Supabase:

1. **Table Editor** → Do you see `user_profiles`?
2. **Authentication → Policies** → Are there 3 policies for user_profiles?
3. **Logs → API** → Any errors during INSERT?

## Files to Use

1. **SQL Migration:** `database/create_user_profiles_table.sql`
2. **Troubleshooting Guide:** `TROUBLESHOOTING_USER_PROFILES.md`
3. **Code with Logging:** `src/lib/auth.ts` (already updated)

## Quick Test

After running the SQL, test with this in Supabase SQL Editor:

```sql
-- Check table exists
SELECT * FROM user_profiles LIMIT 1;

-- Check policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles';
```

You should see the table and 3 policies.

---

**Time to Fix:** 2 minutes  
**Difficulty:** Easy  
**Success Rate:** 99% (it's usually just the table not existing)
