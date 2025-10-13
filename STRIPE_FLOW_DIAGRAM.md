# Stripe Integration Flow Diagram

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEW USER SIGNS UP                         │
│                    trial_used = false (default)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FIRST TIME: Click "Plan Meals"                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │ canGenerateMeals│
                    │   check trial   │
                    └─────────────────┘
                              ↓
                         trial_used?
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
                   NO                  YES
                    │                   │
                    ↓                   ↓
        ┌────────────────────┐   ┌──────────────┐
        │  ✅ GENERATE MEALS │   │ subscription?│
        │  (Trial allowed)   │   └──────────────┘
        └────────────────────┘          ↓
                    ↓              ┌────┴────┐
        ┌────────────────────┐   │         │
        │ markTrialAsUsed()  │  YES       NO
        │ trial_used = true  │   │         │
        └────────────────────┘   │         ↓
                                 │   ┌──────────────┐
                                 │   │ ❌ SHOW      │
                                 │   │ PaymentModal │
                                 │   └──────────────┘
                                 │
                                 ↓
                    ┌────────────────────┐
                    │ ✅ GENERATE MEALS  │
                    │  (Subscribed)      │
                    └────────────────────┘
```

## Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Has Used Trial                          │
│                  Clicks "Plan Meals" Again                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Payment Modal Appears                          │
│             Shows: $29.99/year Annual Subscription              │
│                    All Premium Features                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  ┌───────────────────────┐
                  │ User Clicks "Subscribe"│
                  └───────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend (PaymentModal.tsx)                    │
│    POST /api/create-checkout-session                            │
│    Body: { productId, userId, userEmail }                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Backend (Your API Endpoint)                     │
│  stripe.checkout.sessions.create({                              │
│    line_items: [{ price_data: { amount: 2999 } }],             │
│    customer_email: userEmail,                                   │
│    metadata: { userId }                                         │
│  })                                                             │
│  Returns: { sessionId, url }                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Redirect to Stripe Checkout                    │
│              User enters card: 4242 4242 4242 4242              │
│                    Completes Payment                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Stripe Webhook Triggers                         │
│              Event: checkout.session.completed                   │
│         POST /api/stripe-webhook (Your Backend)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               Backend Updates Supabase Database                  │
│  updateSubscription(userId, subscriptionId, customerId,         │
│                    'active', endDate)                           │
│  Sets: subscription_status = 'active'                           │
│        subscription_id = 'sub_xxx'                              │
│        stripe_customer_id = 'cus_xxx'                           │
│        subscription_end_date = 1 year from now                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              User Redirected to Dashboard                        │
│          success_url: /dashboard?payment=success                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            User Can Now Generate Unlimited Meals! 🎉            │
└─────────────────────────────────────────────────────────────────┘
```

## Database State Changes

### Before Trial

```
user_profiles:
{
  user_id: "abc123",
  email: "user@example.com",
  trial_used: false,              // ← User has trial
  subscription_status: null,
  subscription_id: null,
  stripe_customer_id: null,
  subscription_end_date: null
}
```

### After Trial (1st Meal Plan)

```
user_profiles:
{
  user_id: "abc123",
  email: "user@example.com",
  trial_used: true,               // ← Trial consumed
  subscription_status: null,      // ← No subscription yet
  subscription_id: null,
  stripe_customer_id: null,
  subscription_end_date: null
}
```

### After Subscription

```
user_profiles:
{
  user_id: "abc123",
  email: "user@example.com",
  trial_used: true,
  subscription_status: "active",   // ← Subscribed!
  subscription_id: "sub_xxx",
  stripe_customer_id: "cus_xxx",
  subscription_end_date: "2026-10-12T00:00:00Z"
}
```

## Code Logic Flow

### canGenerateMeals() Function

```typescript
async function canGenerateMeals(userId: string) {
  const profile = await getProfile(userId)

  // Check 1: Active subscription?
  if (profile.subscription_status === 'active') {
    if (profile.subscription_end_date > now) {
      return { canGenerate: true } ✅
    }
  }

  // Check 2: Trial available?
  if (!profile.trial_used) {
    return { canGenerate: true } ✅
  }

  // No subscription, no trial
  return {
    canGenerate: false, ❌
    reason: 'Trial used - subscription required'
  }
}
```

### handleGenerateMeals() Flow

```typescript
async function handleGenerateMeals(numPeople, mealType, notes) {
  // 1. Check permission
  const { canGenerate, reason } = await canGenerateMeals(userId);

  if (!canGenerate) {
    showPaymentModal(); // ← Show subscription modal
    return;
  }

  // 2. Generate meals
  const meals = await generateMealPlan(numPeople, mealType, notes);

  // 3. Mark trial as used (first time only)
  if (!profile.trial_used) {
    await markTrialAsUsed(userId);
  }

  // 4. Display meals
  displayMeals(meals);
}
```

## Component Hierarchy

```
App.tsx
├── LandingPage
├── SignInPage
├── SignUpPage
└── Dashboard
    ├── Header
    ├── Main Content
    │   ├── MealPlannerForm (Dialog)
    │   │   └── Form Fields
    │   │
    │   ├── PaymentModal (Dialog) ← NEW
    │   │   ├── Subscription Details
    │   │   ├── Feature List
    │   │   └── Subscribe Button
    │   │       └── Stripe Checkout
    │   │
    │   ├── Dashboard Tab
    │   │   └── MealCard[]
    │   │
    │   ├── My Recipes Tab
    │   │   └── MyRecipesView
    │   │
    │   └── Shopping List Tab
    │       └── ShoppingListView
    │
    └── Footer
```

## API Endpoints Required

### Frontend → Backend

```
POST /api/create-checkout-session
Request: {
  productId: "prod_TE2EWoB1u1ykq0",
  userId: "abc123",
  userEmail: "user@example.com"
}
Response: {
  sessionId: "cs_test_xxx",
  url: "https://checkout.stripe.com/xxx"
}
```

### Stripe → Backend (Webhook)

```
POST /api/stripe-webhook
Headers: {
  stripe-signature: "xxx"
}
Body: {
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_xxx",
      customer: "cus_xxx",
      metadata: { userId: "abc123" }
    }
  }
}
```

### Backend → Supabase

```sql
UPDATE user_profiles
SET
  subscription_status = 'active',
  subscription_id = 'sub_xxx',
  stripe_customer_id = 'cus_xxx',
  subscription_end_date = '2026-10-12'
WHERE user_id = 'abc123';
```

## File Dependencies

```
App.tsx
  ↓
  ├─→ lib/subscription.ts
  │     ├─→ canGenerateMeals()
  │     ├─→ markTrialAsUsed()
  │     └─→ updateSubscription()
  │
  ├─→ lib/stripe.ts
  │     └─→ getStripe()
  │
  └─→ components/PaymentModal.tsx
        ├─→ lib/stripe.ts
        └─→ Stripe Checkout API
```

## Environment Variables Map

```
Frontend (.env):
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_OPENAI_API_KEY
(No Stripe secret keys in frontend!)

Backend (.env):
⚠️ STRIPE_SECRET_KEY=sk_test_xxx    ← Add this
⚠️ STRIPE_WEBHOOK_SECRET=whsec_xxx  ← Add this
⚠️ CLIENT_URL=http://localhost:5174 ← Add this
```

## Testing Checklist

- [ ] New user signs up
- [ ] First "Plan Meals" works (trial)
- [ ] Database shows trial_used = true
- [ ] Second "Plan Meals" shows payment modal
- [ ] Payment modal displays correct price
- [ ] "Subscribe Now" calls backend API
- [ ] Stripe checkout page loads
- [ ] Test payment succeeds
- [ ] Webhook updates database
- [ ] User can generate unlimited meals
- [ ] Subscription status shows in database
