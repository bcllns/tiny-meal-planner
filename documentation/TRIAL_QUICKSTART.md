# Quick Start: 7-Day Trial Update

## What Changed

✅ **Trial is now 7 days** instead of 2 free meal plans  
✅ **Unlimited meal plans** during the 7-day trial  
✅ **Clear expiration date** shown on dashboard

## What You Need to Do

### 1. Run Database Migration

Open your Supabase SQL Editor and run:

```sql
-- Add trial_start_date column
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set trial_start_date for existing users
UPDATE user_profiles
SET trial_start_date = created_at
WHERE trial_start_date IS NULL;
```

Or use the file: `database/add_trial_start_date.sql`

### 2. Deploy Code

The code changes are already in your files. Just commit and push:

```bash
git add .
git commit -m "Update trial system to 7-day time-based model"
git push
```

### 3. Test

- Sign up as a new user
- Check that the trial expiry date appears under "Plan Meals" button
- Try generating multiple meal plans (should work unlimited times during trial)

## What Users Will See

### New Dashboard Message

**Before:** "2 free meal plans remaining"  
**After:** "Free trial expires Oct 26, 2025"

### Tutorial

**Before:** "generate meal plans twice for free"  
**After:** "7-day free trial with unlimited meal plan generation"

### Payment Modal

**Before:** "You've used your 2 free meal plans"  
**After:** "Your 7-day free trial has expired"

## For Existing Users

Users who signed up:

- **Less than 7 days ago:** Will have remaining trial days
- **More than 7 days ago:** Trial will be expired, will need to subscribe

## Need More Info?

See `TRIAL_SYSTEM_UPDATE.md` for complete documentation.
