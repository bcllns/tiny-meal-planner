# Meal Plan Usage Tracking Implementation

## Overview

Updated the app to track meal planner form submissions and allow users to generate **2 free meal plans** before requiring a subscription. The system now counts actual form submissions rather than just marking a boolean trial flag.

## Key Changes

### 1. Database Migration

**File:** `database/add_tutorial_shown_column.sql`

Added new columns to the `user_profiles` table:

- `tutorial_shown` (BOOLEAN, DEFAULT FALSE) - Tracks if user has seen the tutorial dialog
- `meal_plans_generated` (INTEGER, DEFAULT 0) - **NEW** - Counts how many meal plans the user has generated
- Added indexes for both columns for faster lookups

**To Apply:** Run this SQL in your Supabase SQL Editor.

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS tutorial_shown BOOLEAN DEFAULT FALSE;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS meal_plans_generated INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_profiles_tutorial_shown ON user_profiles(tutorial_shown);
CREATE INDEX IF NOT EXISTS idx_user_profiles_meal_plans_generated ON user_profiles(meal_plans_generated);
```

### 2. TypeScript Types

**File:** `src/types/user.ts`

Updated `UserProfile` interface to include:

```typescript
meal_plans_generated?: number
```

### 3. Subscription Library Updates

**File:** `src/lib/subscription.ts`

#### New Constant

```typescript
const FREE_MEAL_PLAN_LIMIT = 2;
```

#### Updated `canGenerateMeals()` Function

- Now checks `meal_plans_generated` count instead of `trial_used` boolean
- Returns `remainingFreePlans` in the response
- Provides specific error message: "You've used your 2 free meal plans - subscription required"

**Before:**

```typescript
{ canGenerate: boolean; reason?: string }
```

**After:**

```typescript
{ canGenerate: boolean; reason?: string; remainingFreePlans?: number }
```

#### New `incrementMealPlanCount()` Function

```typescript
async function incrementMealPlanCount(userId: string): Promise<{ success: boolean; newCount?: number }>;
```

- Fetches current count
- Increments by 1
- Updates `meal_plans_generated` in database
- Also marks `trial_used = true` when count reaches 2 (for backward compatibility)
- Returns success status and new count

**Key Behavior:** This function is called **ONLY** when a meal plan is successfully generated after form submission.

### 4. App Integration

**File:** `src/App.tsx`

#### Updated Imports

- Replaced `markTrialAsUsed` with `incrementMealPlanCount`
- Added `Sparkles` icon import

#### Updated `handleGenerateMeals()` Function

**Previous Logic:**

- Checked if `trial_used === false`
- Called `markTrialAsUsed()` after first successful generation
- Marked as boolean true

**New Logic:**

- Calls `incrementMealPlanCount()` after **EVERY** successful meal plan generation
- Updates local state with new count
- Marks `trial_used = true` when count reaches 2

```typescript
const { success, newCount } = await incrementMealPlanCount(user.id);
if (success && newCount !== undefined) {
  setUserProfile({
    ...userProfile,
    meal_plans_generated: newCount,
    trial_used: newCount >= 2,
  });
}
```

#### Added Free Trial Indicator

On the dashboard empty state, added a visual badge showing:

- "2 free meal plans remaining" (when count = 0)
- "1 free meal plan remaining" (when count = 1)
- Badge hidden when user has subscription or when limit reached

Visual design:

- Emerald-themed badge with Sparkles icon
- Appears below "Plan Meals" button
- Only visible for non-subscribed users with remaining free plans

### 5. Payment Modal Update

**File:** `src/components/PaymentModal.tsx`

Updated messaging to reflect the new limit:

```typescript
"You've used your 2 free meal plans. Subscribe to continue planning delicious meals!";
```

### 6. Tutorial Dialog

**File:** `src/components/TutorialDialog.tsx`

The tutorial dialog already mentions "twice for free" in the trial information section, so it aligns perfectly with the new implementation.

## User Experience Flow

### First-Time User Journey

1. **Sign Up/Sign In**

   - `meal_plans_generated = 0`
   - Tutorial dialog appears explaining 2 free meal plans

2. **First Meal Plan**

   - User fills out form and submits
   - Meal plan generates successfully
   - `incrementMealPlanCount()` called → count becomes 1
   - Badge shows: "1 free meal plan remaining"

3. **Second Meal Plan**

   - User submits form again
   - Meal plan generates successfully
   - `incrementMealPlanCount()` called → count becomes 2
   - `trial_used` marked as `true`
   - Badge no longer shows (limit reached)

4. **Third Attempt**
   - User clicks "Plan Meals"
   - `canGenerateMeals()` returns `canGenerate: false`
   - Payment modal appears
   - Shows message: "You've used your 2 free meal plans..."

### Important Notes

- ✅ Count only increments on **successful** meal plan generation
- ✅ If API fails or user closes form without submitting, count doesn't increment
- ✅ Users with active subscriptions can generate unlimited meal plans
- ✅ The badge only shows for non-subscribed users with remaining free plans
- ✅ `trial_used` boolean maintained for backward compatibility

## Backward Compatibility

### Existing Users

For users who already have `trial_used = true`:

- Their `meal_plans_generated` will be `0` initially (database default)
- System checks subscription status first
- If no subscription, they'll be prompted to subscribe
- The count-based system works alongside the boolean flag

### Legacy `markTrialAsUsed()` Function

- Still exists in `subscription.ts` for compatibility
- No longer called in App.tsx
- Can be removed in future cleanup

## Testing Checklist

### Database Setup

- [ ] Run the migration SQL in Supabase
- [ ] Verify `meal_plans_generated` column exists with DEFAULT 0
- [ ] Verify indexes are created

### New User Flow

- [ ] Sign up as a new user
- [ ] Verify tutorial dialog appears
- [ ] Submit meal planner form successfully
- [ ] Check database: `meal_plans_generated = 1`
- [ ] Verify badge shows "1 free meal plan remaining"
- [ ] Submit form again successfully
- [ ] Check database: `meal_plans_generated = 2`, `trial_used = true`
- [ ] Verify badge no longer appears
- [ ] Try to plan meals again
- [ ] Verify payment modal appears with correct message

### Error Handling

- [ ] Submit form but API fails
- [ ] Verify count does NOT increment on failure
- [ ] Open form modal but close without submitting
- [ ] Verify count does NOT increment

### Subscribed User

- [ ] User with active subscription
- [ ] Verify no badge shows
- [ ] Verify unlimited meal plan generation
- [ ] Count should still increment (for analytics) but not restrict access

### UI/UX

- [ ] Badge displays correctly on dashboard
- [ ] Badge shows correct pluralization ("plan" vs "plans")
- [ ] Badge has proper styling (emerald theme)
- [ ] Payment modal shows "2 free meal plans" message

## Migration Path for Existing Users

If you have existing users with `trial_used = true`:

**Option 1: Reset Everyone (Fresh Start)**

```sql
UPDATE user_profiles
SET meal_plans_generated = 0, trial_used = false
WHERE subscription_status IS NULL OR subscription_status != 'active';
```

**Option 2: Set Existing Trial Users to Limit**

```sql
UPDATE user_profiles
SET meal_plans_generated = 2
WHERE trial_used = true
  AND (subscription_status IS NULL OR subscription_status != 'active');
```

**Option 3: Give Everyone 2 Fresh Plans**

```sql
UPDATE user_profiles
SET meal_plans_generated = 0, trial_used = false;
```

Choose based on your business requirements and user communication strategy.

## Future Enhancements

### Possible Additions

1. **Usage Analytics Dashboard**

   - Track average meal plans per user
   - Conversion rate from free to paid

2. **Flexible Limits**

   - Make `FREE_MEAL_PLAN_LIMIT` configurable
   - A/B test different free limits (2 vs 3 vs 5)

3. **Usage History**

   - Create `meal_plan_generations` table
   - Track timestamp, preferences, success/failure for each generation

4. **Promotional Bonuses**

   - Add `bonus_meal_plans` column
   - "Refer a friend, get 2 extra meal plans"

5. **Usage Warnings**
   - Show toast notification after first plan: "1 free meal plan remaining!"
   - More prominent CTA before limit is reached

## Technical Decisions

### Why Integer Count Instead of Boolean?

- **Flexibility**: Easy to adjust free limit (change constant)
- **Analytics**: Track actual usage patterns
- **Transparency**: Users see exact remaining count
- **Promotions**: Can add bonus plans in future

### Why Increment After Success Only?

- **Fair**: Users only "use" a plan if they get results
- **UX**: If API fails, user shouldn't lose their attempt
- **Billing**: Only count valuable interactions

### Why Keep `trial_used` Boolean?

- **Backward Compatibility**: Existing code/queries might rely on it
- **Simple Flag**: Quick check for "has user ever used trial?"
- **Migration Safety**: Don't break existing users' access
