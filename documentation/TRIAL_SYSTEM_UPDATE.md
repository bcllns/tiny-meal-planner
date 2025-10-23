# 7-Day Trial System Implementation

## Overview

The trial system has been updated from a usage-based model (2 free meal plans) to a time-based model (7-day free trial with unlimited meal plans).

## Changes Made

### 1. Database Schema

**New Column:** `trial_start_date`

- Type: `TIMESTAMP WITH TIME ZONE`
- Default: `NOW()`
- Purpose: Tracks when the user's 7-day trial started

**Migration File:** `database/add_trial_start_date.sql`

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- For existing users, set trial_start_date to their created_at date
UPDATE user_profiles
SET trial_start_date = created_at
WHERE trial_start_date IS NULL;
```

### 2. TypeScript Types

**Updated Files:**

- `src/types/user.ts` - Added `trial_start_date?: string`
- `src/lib/subscription.ts` - Added `trial_start_date: string` to UserProfile interface

### 3. Subscription Logic

**File:** `src/lib/subscription.ts`

**Removed:**

- `FREE_MEAL_PLAN_LIMIT` constant (was 2)

**Added:**

- `TRIAL_DURATION_DAYS` constant (set to 7)
- `getTrialDaysRemaining(trialStartDate: string): number` - Calculates days remaining
- `getTrialExpiryDate(trialStartDate: string): Date` - Returns trial expiry date
- `isTrialExpired(trialStartDate: string): boolean` - Checks if trial has expired

**Updated:**

- `canGenerateMeals()` - Now checks trial expiration by date instead of usage count
- `incrementMealPlanCount()` - Marks trial as used based on date, not count

### 4. User Profile Creation

**File:** `src/lib/auth.ts`

When creating new user profiles, `trial_start_date` is now set to the current timestamp:

```typescript
trial_start_date: new Date().toISOString();
```

### 5. UI Updates

**File:** `src/App.tsx`

**Trial Indicator:**
Before:

```tsx
{2 - (userProfile.meal_plans_generated || 0)} free meal plans remaining
```

After:

```tsx
Free trial expires {expiryDate}
```

**File:** `src/components/TutorialDialog.tsx`

Updated trial description from "twice for free" to "7-day free trial with unlimited meal plan generation"

**File:** `src/components/PaymentModal.tsx`

Updated message from "You've used your 2 free meal plans" to "Your 7-day free trial has expired"

## How It Works

### New User Flow

1. **User Signs Up**

   - `trial_start_date` is set to current timestamp
   - `trial_used` is set to `false`
   - User can generate unlimited meal plans

2. **During Trial (Days 1-7)**

   - User can generate unlimited meal plans
   - UI shows: "Free trial expires [date]"
   - No restrictions on meal plan generation

3. **After 7 Days**
   - `isTrialExpired()` returns `true`
   - `canGenerateMeals()` returns `false`
   - Payment modal is shown
   - UI message: "Your 7-day free trial has expired"

### Existing Users

When the migration runs:

- Existing users without `trial_start_date` will have it set to their `created_at` date
- This ensures they get the appropriate trial period based on when they signed up
- Users who signed up more than 7 days ago will see trial as expired
- Users who signed up less than 7 days ago will have remaining trial days

## Benefits

1. **Better User Experience**

   - Users can explore the app fully without worrying about running out of tries
   - Clear expiration date instead of confusing usage count

2. **More Conversions**

   - Users can generate as many meal plans as they want during trial
   - More time to see the value of the app

3. **Simpler Logic**
   - Date-based expiration is easier to understand
   - No need to track usage counts for trial purposes

## Testing Checklist

- [ ] Run database migration: `add_trial_start_date.sql`
- [ ] New users see trial expiry date under "Plan Meals" button
- [ ] Trial date shows correct expiration (7 days from signup)
- [ ] Users can generate unlimited meal plans during trial
- [ ] After 7 days, users see payment modal
- [ ] Payment modal shows updated "7-day trial expired" message
- [ ] Tutorial dialog mentions "7-day free trial"

## Migration Steps

1. **Backup your database** (always!)

2. **Run the migration SQL:**

   ```sql
   -- In your Supabase SQL Editor
   -- Copy and paste contents of database/add_trial_start_date.sql
   ```

3. **Deploy the code changes:**

   ```bash
   git add .
   git commit -m "Update trial system from usage-based to 7-day time-based"
   git push
   ```

4. **Verify in production:**
   - Check existing user profiles have `trial_start_date` set
   - Test new user signup shows trial expiry date
   - Test trial expiration after 7 days

## Rollback Plan

If you need to rollback:

1. **Revert code changes:**

   ```bash
   git revert HEAD
   ```

2. **Database column can stay** - The `trial_start_date` column doesn't hurt anything and can be used for analytics

3. **Or remove column:**
   ```sql
   ALTER TABLE user_profiles DROP COLUMN IF EXISTS trial_start_date;
   ```

## Future Enhancements

Possible improvements:

- Add email notification 2 days before trial expires
- Add trial extension capability for certain users
- Add trial days as an admin-configurable setting
- Track trial conversion rate in analytics
