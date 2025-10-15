# User Profile Auto-Creation

## Overview

The app now **automatically creates** a `user_profiles` record when a user signs up, with `trial_used` set to `false`.

## How It Works

### Sign Up Flow

1. **User signs up** with email, password, and name
2. **Supabase Auth** creates authentication record
3. **App automatically creates** user_profiles record with:
   ```typescript
   {
     user_id: (from auth),
     email: (from auth),
     full_name: (from form),
     trial_used: false,        // ✅ Ready for free trial
     subscription_status: null,
     subscription_id: null,
     stripe_customer_id: null,
     subscription_end_date: null
   }
   ```

### First Login (Existing Users)

If a user signs in and doesn't have a profile record (e.g., they signed up before this feature):

1. **App detects** missing profile
2. **Automatically creates** the profile record
3. **Sets trial_used** to `false` (they get a free trial!)

## Code Changes

### Updated Files

**`src/lib/auth.ts`**

- ✅ `signUp()` - Creates profile after successful signup
- ✅ `getUserProfile()` - Fetches from database and auto-creates if missing

### What Happens

#### During Sign Up (`signUp` function)

```typescript
1. Create auth user with Supabase
2. ✅ Insert into user_profiles table
   - Sets trial_used = false
   - All subscription fields = null
3. Return user data
```

#### When Getting Profile (`getUserProfile` function)

```typescript
1. Get current auth user
2. Query user_profiles table
3. If no profile found:
   - ✅ Auto-create profile
   - Set trial_used = false
4. Return profile with subscription data
```

## Database Schema

Make sure you've run the migration to add subscription fields:

```sql
-- File: database/add_subscription_fields.sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL,
-- ... etc
```

## Benefits

### ✅ Automatic Setup

- No manual database entries needed
- Every new user gets a profile automatically
- Existing users get profiles on first login

### ✅ Trial System Works Immediately

- New users: `trial_used = false` → can plan 1 free meal
- After trial: `trial_used = true` → payment required

### ✅ Handles Edge Cases

- Profile creation fails? → Signup still succeeds (profile created on next login)
- Existing user without profile? → Auto-created with trial available

## Testing

### Test New User Signup

1. Go to signup page
2. Enter email, password, name
3. Submit
4. ✅ Check Supabase → user_profiles table
5. Should see new record with `trial_used = false`

### Test Existing User (Manual)

If you have existing users without profiles:

1. They sign in
2. App fetches profile → not found
3. App auto-creates profile
4. Sets `trial_used = false`
5. ✅ They get a free trial!

## Troubleshooting

### Profile not created after signup

**Check:**

- Supabase connection is working
- user_profiles table exists
- Table has correct columns
- RLS policies allow insert

**Solution:**

- Profile will be created on next login
- Check browser console for errors

### "trial_used" is null instead of false

**Check:**

- Database migration was run
- Column has DEFAULT FALSE

**Solution:**

```sql
UPDATE user_profiles
SET trial_used = false
WHERE trial_used IS NULL;
```

### Existing users showing as subscribed

**This shouldn't happen** - new users get:

- `trial_used = false` (can use trial)
- `subscription_status = null` (not subscribed)

## Migration for Existing Users

If you have existing users without profiles:

### Option 1: Automatic (Recommended)

They'll get profiles automatically on next login with `trial_used = false`

### Option 2: Bulk Create

```sql
-- Create profiles for all existing auth users
INSERT INTO user_profiles (user_id, email, full_name, trial_used)
SELECT
  id as user_id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as full_name,
  false as trial_used
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);
```

## Summary

### What Changed

- ✅ `signUp()` creates user_profiles record automatically
- ✅ `getUserProfile()` fetches from database (not just metadata)
- ✅ Auto-creates missing profiles on login
- ✅ All new users start with `trial_used = false`

### Developer Notes

- Profile creation is non-blocking (signup succeeds even if profile fails)
- Profile auto-created on next login if initial creation failed
- Existing users get profiles automatically with trial available
- No manual database work needed

---

**Status:** ✅ Fully Automated  
**Requires:** Database migration (add_subscription_fields.sql)  
**Testing:** Create new account and check Supabase table
