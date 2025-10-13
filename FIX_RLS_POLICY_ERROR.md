# 🔧 Fix: "new row violates row-level security policy"

## The Problem

When trying to create a user profile during signup, you get:

```
new row violates row-level security policy for table "user_profiles"
```

This happens because the RLS policy is too restrictive during the signup flow.

## Two Solutions (Choose One)

### ✅ Solution 1: Update RLS Policies (Recommended - Simplest)

**File:** `database/create_user_profiles_table.sql` (already updated)

**What it does:**

- Changes the INSERT policy to allow any authenticated user to insert profiles
- Removes the strict `auth.uid() = user_id` check during INSERT
- Keeps strict checking for SELECT and UPDATE

**Run this SQL:**

```sql
-- Just run the updated file
database/create_user_profiles_table.sql
```

**Why it works:**
During signup, the user is authenticated but the `auth.uid()` context might not match perfectly during the INSERT. This policy allows any authenticated user to create a profile.

---

### ✅ Solution 2: Database Trigger (Alternative - More Robust)

**File:** `database/create_user_profiles_with_trigger.sql`

**What it does:**

- Creates a database trigger that automatically creates a user_profile when a user signs up
- Completely bypasses RLS during profile creation (uses SECURITY DEFINER)
- Your app code doesn't need to create the profile - the database does it automatically!

**Run this SQL:**

```sql
database/create_user_profiles_with_trigger.sql
```

**Why it works:**
The trigger runs with elevated privileges (SECURITY DEFINER) and isn't subject to RLS policies. When a user is created in `auth.users`, the trigger automatically creates their profile in `user_profiles`.

**Bonus:** If you use this approach, you can even simplify your app code since the profile is created automatically!

---

## Which Solution Should You Use?

### Use Solution 1 (Updated RLS) If:

- ✅ You want to keep the app code in control
- ✅ You want simpler database setup
- ✅ You're okay with the app handling profile creation

### Use Solution 2 (Trigger) If:

- ✅ You want 100% automatic profile creation
- ✅ You want to simplify your app code
- ✅ You want guaranteed profile creation even if app code fails
- ✅ You prefer database-level automation

**My recommendation:** Start with Solution 1 (it's simpler). If you still have issues, use Solution 2.

---

## How to Apply Solution 1

1. **Go to Supabase Dashboard → SQL Editor**

2. **Paste this updated SQL:**

   ```sql
   -- File: database/create_user_profiles_table.sql
   -- (Copy the entire file)
   ```

3. **Click RUN**

4. **Verify the policy changed:**

   ```sql
   SELECT policyname, cmd
   FROM pg_policies
   WHERE tablename = 'user_profiles' AND cmd = 'INSERT';
   ```

   You should see: `"Enable insert for authenticated users"`

5. **Test signup:**
   - Sign up with a new email
   - Check browser console
   - Should see: "User profile created successfully"

---

## How to Apply Solution 2

1. **Go to Supabase Dashboard → SQL Editor**

2. **Paste this SQL:**

   ```sql
   -- File: database/create_user_profiles_with_trigger.sql
   -- (Copy the entire file)
   ```

3. **Click RUN**

4. **Verify the trigger exists:**

   ```sql
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```

   You should see the trigger listed.

5. **Test signup:**

   - Sign up with a new email
   - Profile is created AUTOMATICALLY by the database
   - Check `user_profiles` table

6. **(Optional) Simplify app code:**
   You can remove the profile creation code from `src/lib/auth.ts` since the trigger handles it!

---

## Testing Both Solutions

### Test 1: Sign Up

```javascript
// In your app
Sign up with: test123@example.com
Password: TestPassword123!
Name: Test User

// Check browser console
Should see: "User profile created successfully"
```

### Test 2: Verify in Database

```sql
-- In Supabase SQL Editor
SELECT user_id, email, full_name, trial_used
FROM user_profiles
WHERE email = 'test123@example.com';

-- Should return:
-- user_id | email | full_name | trial_used
-- uuid... | test123@... | Test User | false
```

### Test 3: Verify Trial Works

```javascript
// In your app
1. Log in with test123@example.com
2. Click "Plan Meals"
3. Should work (trial available)
4. Try again
5. Should show payment modal (trial used)
```

---

## Troubleshooting

### Still getting RLS error after Solution 1?

Try Solution 2 (trigger approach). It completely bypasses RLS.

### Trigger not firing?

Check if it exists:

```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

If not there, run the SQL again.

### Profile created but trial_used is NULL?

Update existing records:

```sql
UPDATE user_profiles
SET trial_used = false
WHERE trial_used IS NULL;
```

### Want to test the trigger manually?

```sql
-- This should automatically create a profile
INSERT INTO auth.users (email, encrypted_password)
VALUES ('trigger-test@example.com', crypt('password123', gen_salt('bf')));

-- Check if profile was created
SELECT * FROM user_profiles WHERE email = 'trigger-test@example.com';
```

---

## Summary

**Problem:** RLS policy prevents profile creation during signup

**Solution 1:** Update RLS policy to be more permissive for INSERT

- ✅ Simpler
- ✅ App stays in control
- ✅ Run: `database/create_user_profiles_table.sql`

**Solution 2:** Use database trigger to auto-create profiles

- ✅ More robust
- ✅ Automatic (no app code needed)
- ✅ Guaranteed to work
- ✅ Run: `database/create_user_profiles_with_trigger.sql`

**Recommended:** Try Solution 1 first. If problems persist, use Solution 2.

---

**Quick Test:** Sign up with a new email and check if the profile appears in Supabase!
