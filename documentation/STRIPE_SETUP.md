# Stripe Integration Setup Guide

This guide will help you complete the Stripe integration for the Meal Planner app.

## Overview

The app now includes:

- ✅ Trial system (1 free meal plan generation)
- ✅ Subscription checking before meal generation
- ✅ Payment modal UI
- ✅ Database schema for subscriptions
- ⚠️ Backend API endpoints (you need to set this up)

## Database Setup

### 1. Run the SQL Migration

Go to your Supabase project dashboard and run the SQL migration:

```bash
# Location: database/add_subscription_fields.sql
```

This adds the following fields to `user_profiles`:

- `trial_used` (boolean) - Tracks if user used their free trial
- `subscription_status` (text) - Stripe subscription status
- `subscription_id` (text) - Stripe subscription ID
- `stripe_customer_id` (text) - Stripe customer ID
- `subscription_end_date` (timestamp) - When subscription expires

## Backend Setup (Required)

You need to create a backend API to handle Stripe checkout. Here are your options:

### Option 1: Vercel/Netlify Serverless Functions

Create a serverless function at `/api/create-checkout-session`:

```typescript
// api/create-checkout-session.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productId, userId, userEmail } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: productId,
            unit_amount: 2999, // $29.99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?payment=cancelled`,
      customer_email: userEmail,
      metadata: { userId },
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Option 2: Supabase Edge Function

Create a Supabase Edge Function:

```bash
# Install Supabase CLI
npm install -g supabase

# Create edge function
supabase functions new stripe-checkout

# Deploy
supabase functions deploy stripe-checkout
```

See `backend-example/stripe-checkout.ts` for full implementation reference.

## Environment Variables

Add these to your backend:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
CLIENT_URL=http://localhost:5173
```

## Stripe Dashboard Setup

### 1. Get Your Secret Key

- Go to: https://dashboard.stripe.com/test/apikeys
- Copy your **Secret key** (starts with `sk_test_`)
- Add it to your backend environment variables

### 2. Set Up Webhook

- Go to: https://dashboard.stripe.com/test/webhooks
- Click "Add endpoint"
- URL: `https://your-backend.com/api/stripe-webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
- Copy the webhook signing secret

### 3. Create Product (Already Done)

Your product is already set up:

- Product ID: `prod_TE2EWoB1u1ykq0`
- Price: $29.99 annual (one-time payment)

## Testing

### Test Flow:

1. **First Meal Generation (Trial)**

   - User clicks "Plan Meals"
   - Meal plan generates successfully
   - Database updated: `trial_used = true`

2. **Second Meal Generation (Subscription Required)**

   - User clicks "Plan Meals"
   - Payment modal appears
   - User sees subscription details

3. **Payment (Test Mode)**

   - Click "Subscribe Now"
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Payment processes
   - Webhook updates database

4. **Successful Subscription**
   - User redirected to dashboard
   - Can generate unlimited meal plans
   - Subscription status: `active`

## Stripe Test Cards

Use these for testing:

| Card Number         | Result                  |
| ------------------- | ----------------------- |
| 4242 4242 4242 4242 | Success                 |
| 4000 0000 0000 0002 | Decline                 |
| 4000 0025 0000 3155 | Requires authentication |

## How It Works

### User Flow:

```
1. Sign up/Sign in
   ↓
2. Click "Plan Meals" (First time)
   ↓
3. Meal plan generated ✅
   ↓
4. Database: trial_used = true
   ↓
5. Click "Plan Meals" (Second time)
   ↓
6. Payment modal shows
   ↓
7. User subscribes via Stripe
   ↓
8. Webhook updates subscription_status = 'active'
   ↓
9. User can generate unlimited meal plans
```

### Code Flow:

```typescript
// 1. User clicks "Plan Meals"
handlePlanMeals() → opens modal

// 2. User submits form
handleGenerateMeals()
  → canGenerateMeals(userId) // Check subscription
  → if (!canGenerate) show PaymentModal
  → if (canGenerate) generateMealPlan()
  → markTrialAsUsed(userId) // First time only
```

## Webhook Handler (Required)

Create an endpoint to handle successful payments:

```typescript
// /api/stripe-webhook
import { updateSubscription } from "@/lib/subscription";

export default async function handler(req, res) {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers["stripe-signature"],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    // Update subscription in database
    await updateSubscription(
      userId,
      session.id,
      session.customer,
      "active",
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    );
  }

  res.json({ received: true });
}
```

## Production Checklist

Before going live:

- [ ] Run database migration in production Supabase
- [ ] Replace test keys with live keys (`pk_live_...` and `sk_live_...`)
- [ ] Update webhook endpoint to production URL
- [ ] Test full payment flow in live mode
- [ ] Set up proper error monitoring
- [ ] Add customer support contact info

## Troubleshooting

### "Failed to create checkout session"

- Check backend is running
- Verify STRIPE_SECRET_KEY is set
- Check API endpoint URL in PaymentModal.tsx

### "Subscription required" but user paid

- Check webhook is configured
- Verify webhook secret
- Check Supabase logs for subscription update

### Trial not working

- Check database migration ran successfully
- Verify `trial_used` column exists
- Check user_profiles table permissions

## Support

For Stripe support:

- Documentation: https://stripe.com/docs
- Test mode: https://dashboard.stripe.com/test
- Help: https://support.stripe.com

## Next Steps

1. ✅ Database migration complete
2. ✅ Frontend integration complete
3. ⚠️ **Set up backend API endpoint**
4. ⚠️ **Configure Stripe webhook**
5. ⚠️ **Test payment flow**
6. ⚠️ **Deploy to production**
