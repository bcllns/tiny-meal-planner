# Trial System Flow

## How It Works

### First Time User Journey

1. **User signs up** → `trial_used = false` (automatically set by database trigger)

2. **User clicks "Plan Meals" button** (1st time)

   - ✅ Check: `canGenerateMeals(userId)` returns `true` (trial available)
   - ✅ Opens meal planner form modal

3. **User submits form** (selects # of people, meal type, notes)

   - ✅ Generates meal plan via OpenAI
   - ✅ Displays meals on dashboard
   - ✅ **Marks trial as used**: `trial_used = true`

4. **User clicks "Plan Meals" button** (2nd time)

   - ❌ Check: `canGenerateMeals(userId)` returns `false` (trial used, no subscription)
   - ❌ Opens **payment modal** instead of form
   - 💳 User must subscribe to continue

5. **After subscribing**
   - ✅ `subscription_status = 'active'`
   - ✅ Unlimited meal plans available

---

## Code Flow

### When "Plan Meals" Button Clicked

```typescript
const handlePlanMeals = async () => {
  // Check subscription status FIRST
  const { canGenerate, reason } = await canGenerateMeals(user.id);

  if (!canGenerate) {
    // Trial used + no subscription = show payment modal
    setShowPaymentModal(true);
    return;
  }

  // Trial available OR active subscription = show form
  setShowFormModal(true);
};
```

### When Form Submitted

```typescript
const handleGenerateMeals = async (numberOfPeople, mealType, notes) => {
  // Generate meals (no check needed - already passed in handlePlanMeals)
  const meals = await generateMealPlan(numberOfPeople, mealType, notes);

  // Mark trial as used AFTER successful generation
  if (!userProfile.trial_used) {
    await markTrialAsUsed(user.id);
  }

  // Display meals
  setMeals(meals);
};
```

---

## Subscription Check Logic

### `canGenerateMeals(userId)` Function

```typescript
// Returns: { canGenerate: true/false, reason?: string }

// ✅ Case 1: Active subscription
if (subscription_status === "active" && subscription_end_date > now) {
  return { canGenerate: true };
}

// ✅ Case 2: Trial available
if (trial_used === false) {
  return { canGenerate: true };
}

// ❌ Case 3: Trial used, no subscription
return {
  canGenerate: false,
  reason: "Trial used - subscription required",
};
```

---

## Visual Flow Diagram

```
┌─────────────────┐
│   User Signs Up │
│ trial_used=false│
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Click "Plan Meals"  │ ◄──────────┐
│    (1st time)       │            │
└────────┬────────────┘            │
         │                         │
         ▼                         │
┌─────────────────────┐            │
│ canGenerateMeals()  │            │
│   returns TRUE      │            │
│ (trial available)   │            │
└────────┬────────────┘            │
         │                         │
         ▼                         │
┌─────────────────────┐            │
│ Show Meal Planner   │            │
│       Form          │            │
└────────┬────────────┘            │
         │                         │
         ▼                         │
┌─────────────────────┐            │
│  Submit Form with   │            │
│  preferences        │            │
└────────┬────────────┘            │
         │                         │
         ▼                         │
┌─────────────────────┐            │
│ Generate Meal Plan  │            │
│    via OpenAI       │            │
└────────┬────────────┘            │
         │                         │
         ▼                         │
┌─────────────────────┐            │
│ Display Meals on    │            │
│     Dashboard       │            │
└────────┬────────────┘            │
         │                         │
         ▼                         │
┌─────────────────────┐            │
│ Mark trial as used  │            │
│ trial_used = TRUE   │            │
└────────┬────────────┘            │
         │                         │
         ▼                         │
┌─────────────────────┐            │
│ Click "Plan Meals"  │────────────┘
│    (2nd time)       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ canGenerateMeals()  │
│   returns FALSE     │
│ (trial used)        │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Show Payment Modal │
│  (Stripe Checkout)  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  User Subscribes    │
│ subscription_status │
│    = 'active'       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Unlimited Access   │
│  to Meal Plans      │
└─────────────────────┘
```

---

## Key Changes Made

### Before

- Subscription check happened AFTER form submission
- User could fill out entire form before being blocked
- Not ideal UX

### After

- ✅ Subscription check happens when clicking "Plan Meals" button
- ✅ Trial marked as used AFTER successful meal generation
- ✅ Second click on "Plan Meals" goes straight to payment modal
- ✅ Better UX - no wasted effort filling out form

---

## Testing Checklist

### Test 1: First Time User

- [ ] Sign up with new account
- [ ] Verify `trial_used = false` in database
- [ ] Click "Plan Meals" button
- [ ] ✅ Should open meal planner form
- [ ] Fill out form and submit
- [ ] ✅ Should generate meals
- [ ] Check database: `trial_used = true`

### Test 2: Trial Used

- [ ] Click "Plan Meals" button again
- [ ] ✅ Should open payment modal (NOT form)
- [ ] Should see message about subscription required

### Test 3: After Subscription

- [ ] Subscribe via Stripe
- [ ] Verify `subscription_status = 'active'`
- [ ] Click "Plan Meals" button
- [ ] ✅ Should open meal planner form
- [ ] Generate meals
- [ ] ✅ Should work unlimited times

---

## Database Trigger Reminder

The `trial_used = false` is set automatically when a user signs up via the database trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, trial_used)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    false  -- ← Trial not used yet
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Summary

| Action             | Trial Available      | Trial Used         | Active Subscription |
| ------------------ | -------------------- | ------------------ | ------------------- |
| Click "Plan Meals" | Show Form            | Show Payment Modal | Show Form           |
| Submit Form        | Generate + Mark Used | N/A                | Generate            |
| Result             | `trial_used = true`  | Must Subscribe     | Unlimited Access    |

**Status:** ✅ Fully Implemented  
**User Experience:** Optimized - check happens upfront, not after form submission
