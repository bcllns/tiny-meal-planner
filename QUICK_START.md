# 🚀 Quick Start Guide - Stripe Integration (No Backend Required!)

## Overview

The Stripe integration now uses **Stripe Payment Links**, which means:
- ✅ **No backend API needed!**
- ✅ Trial system works immediately
- ✅ Payments work with just a Payment Link URL
- ✅ 5-minute setup (down from 1 hour!)

## Step 1: Run Database Migration (5 minutes)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database/add_subscription_fields.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. ✅ You should see "Success. No rows returned"

## Step 2: Test the Trial System (2 minutes)

The trial system works **immediately** without any setup!

1. Make sure dev server is running: `npm run dev`
2. Open http://localhost:5174
3. Create a new account or sign in
4. Click **"Plan Meals"**
5. Fill out the form
6. ✅ Meals should generate (this is your free trial)
7. Click **"Plan Meals"** again
8. ✅ Payment modal should appear!

## Step 3: Create Stripe Payment Link (5 minutes)

Instead of building a backend API, we'll use Stripe's Payment Links feature:

### 3.1 Create the Payment Link

1. Go to https://dashboard.stripe.com/test/payment-links
2. Click **"New payment link"**
3. Fill out the form:
   - **Product:** Select or create "Meal Planner Annual Subscription"
   - **Price:** $29.99 USD
   - **Payment type:** One-time
   - **Collect customer email:** ✅ Yes
   - **After payment:** Redirect to a page
     - Success URL: `http://localhost:5174/dashboard?payment=success`
   - **Collect customer name:** Optional
4. Click **"Create link"**
5. Copy the Payment Link URL (looks like: `https://buy.stripe.com/test_XXXXXXXX`)

### 3.2 Add Payment Link to Your Code

1. Open `src/lib/stripe.ts`
2. Find this line:
   ```typescript
   export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_XXXXXXXX'
   ```
3. Replace the URL with your actual Payment Link URL
4. Save the file

### 3.3 Configure Success Redirect (Optional)

For production, update the Success URL to your production domain:
- Local: `http://localhost:5174/dashboard?payment=success`
- Production: `https://yourdomain.com/dashboard?payment=success`

## Step 4: Test Payment Flow (2 minutes)

1. Click **"Plan Meals"** (should show payment modal since trial is used)
2. Click **"Subscribe Now"**
3. You'll be redirected to Stripe's hosted checkout page
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future expiry (e.g., 12/28)
6. Any 3-digit CVC (e.g., 123)
7. Complete payment
8. ✅ You're redirected back to dashboard with `?payment=success`

## Step 5: Handle Successful Payments

After a user pays, you need to update their subscription status in the database.

### Option A: Manual Update (Simplest)
After a user pays, manually update their subscription in Supabase:

1. Go to Supabase Dashboard → Table Editor → user_profiles
2. Find the user by email
3. Update these fields:
   - `subscription_status`: `active`
   - `subscription_end_date`: (1 year from now)
   - `stripe_customer_id`: (from Stripe Dashboard → Customers)

### Option B: Webhook (Recommended for Production)
Set up a simple webhook to automatically update the database when payment succeeds.

See `STRIPE_WEBHOOK_SETUP.md` for webhook instructions (optional).

## What Works Right Now ✅

- ✅ Trial system (1 free meal plan)
- ✅ Payment modal appears after trial
- ✅ Redirect to Stripe checkout
- ✅ Payment processing
- ✅ Redirect back to app after payment
- ✅ Email prefilled in checkout
- ✅ User ID passed to Stripe (client_reference_id)

## What Needs Manual Setup

- ⚠️ Database update after payment (manual or webhook)
- ⚠️ Production Payment Link URL

## Test Credentials

### Stripe Test Cards
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Auth:** 4000 0025 0000 3155

### Stripe Dashboard
- **Test mode:** https://dashboard.stripe.com/test
- **Payment Links:** https://dashboard.stripe.com/test/payment-links
- **Customers:** https://dashboard.stripe.com/test/customers

## Troubleshooting

### "Cannot find STRIPE_PAYMENT_LINK"
- Did you create the Payment Link in Stripe Dashboard?
- Did you add the URL to `src/lib/stripe.ts`?

### Payment doesn't update subscription status
- This is expected - you need to either:
  - Manually update the database
  - Set up a webhook (see STRIPE_WEBHOOK_SETUP.md)

### Redirect after payment doesn't work
- Check the Success URL in your Payment Link settings
- Make sure it matches your dev server URL (http://localhost:5174)

### User sees payment modal after paying
- The subscription wasn't updated in the database
- Manually update or set up webhook

## Production Checklist

Before going live:

- [ ] Run database migration in production Supabase
- [ ] Create Payment Link in LIVE mode (not test)
- [ ] Update Success URL to production domain
- [ ] Replace Payment Link URL in `src/lib/stripe.ts`
- [ ] Set up webhook for automatic subscription updates (recommended)
- [ ] Test full flow in live mode

## Comparison: Old vs New Approach

### Old Approach (Backend Required) ❌
```
User → Frontend → Backend API → Stripe → Webhook → Database
         ↓          (Express/   
    PaymentModal    Netlify/
                    Vercel)
                    
Time: 1+ hour setup
Complexity: High
Cost: Backend hosting required
```

### New Approach (No Backend) ✅
```
User → Frontend → Stripe Payment Link → Stripe Checkout → Redirect
         ↓          
    PaymentModal    
                    
Time: 15 minutes setup
Complexity: Very Low
Cost: Free (Stripe only)
```

## Next Steps

1. ✅ Run SQL migration
2. ✅ Test trial system
3. ⚠️ Create Payment Link in Stripe
4. ⚠️ Add Payment Link URL to code
5. ⚠️ Test payment flow
6. ⚠️ (Optional) Set up webhook for automatic updates

---

**Total Setup Time:** ~15 minutes  
**Backend Required:** ❌ No!  
**Works Immediately:** ✅ Yes!  

For webhook setup (optional), see `STRIPE_WEBHOOK_SETUP.md`
