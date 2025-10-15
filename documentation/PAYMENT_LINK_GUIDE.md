# Stripe Payment Link Setup - Visual Guide

## Step-by-Step with Screenshots

### Step 1: Go to Stripe Payment Links

🔗 https://dashboard.stripe.com/test/payment-links

Click the "New payment link" button in the top right.

### Step 2: Configure Your Payment Link

#### Product Details

```
Name: Meal Planner Annual Subscription
Description: Unlimited AI-powered meal planning for one year
```

#### Pricing

```
Price: $29.99 USD
Type: One-time payment ✓ (not recurring)
```

#### Payment Options

```
☑ Collect customer email address
☐ Collect customer name (optional)
☐ Collect shipping address (not needed)
```

#### After Payment

```
Success page: ● Redirect to your website
URL: http://localhost:5174/dashboard?payment=success

For production, change to:
URL: https://yourdomain.com/dashboard?payment=success
```

#### Advanced Options (Optional)

```
☑ Allow promotion codes (optional)
☐ Require billing address (not needed)
```

### Step 3: Create and Copy Link

Click **"Create link"** button at the bottom.

You'll see your new Payment Link:

```
https://buy.stripe.com/test_XXXXXXXXXXXXXXX
```

**Copy this entire URL!**

### Step 4: Add to Your Code

Open: `src/lib/stripe.ts`

Find this line (around line 13):

```typescript
export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_XXXXXXXX";
```

Replace with your actual link:

```typescript
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_14k29qfEEgJW8xO6op'
                                    ↑ Your actual Payment Link URL
```

Save the file.

### Step 5: Test the Flow

#### 5.1 Start Your App

```bash
npm run dev
# Opens at: http://localhost:5174
```

#### 5.2 Create Test Account

- Sign up with any email (e.g., test@example.com)
- Create account

#### 5.3 Use Free Trial

- Click "Plan Meals"
- Fill out form (e.g., 2 people, Dinner)
- Generate meals ✅ (This is your free trial!)

#### 5.4 Trigger Payment Modal

- Click "Plan Meals" again
- Payment modal appears ✅

#### 5.5 Go to Stripe Checkout

- Click "Subscribe Now"
- You're redirected to Stripe's page ✅
- URL looks like: https://buy.stripe.com/test_...

#### 5.6 Complete Test Payment

```
Card Number:  4242 4242 4242 4242
Expiry:       12/28 (any future date)
CVC:          123 (any 3 digits)
Email:        (auto-filled from your account)
```

Click "Subscribe"

#### 5.7 Success!

- Payment processes
- Redirected back to: http://localhost:5174/dashboard?payment=success
- You'll see the dashboard ✅

### Step 6: Update Database

Since you used a test payment, you need to manually update the database (or set up webhook later).

#### Go to Supabase Dashboard

🔗 https://supabase.com/dashboard

1. Select your project
2. Click "Table Editor" in sidebar
3. Click "user_profiles" table
4. Find your test user (by email)
5. Click to edit the row
6. Update these fields:
   ```
   subscription_status: active
   subscription_end_date: 2026-10-12 (1 year from now)
   ```
7. Save

#### Test Unlimited Access

- Go back to your app
- Click "Plan Meals" again
- It should work! ✅ (No payment modal)
- You now have unlimited meal planning

## Production Setup

When you're ready to go live:

### 1. Create Live Payment Link

Go to: https://dashboard.stripe.com/payment-links (no /test)

Create a new Payment Link with:

- Same settings as test
- Success URL: `https://yourdomain.com/dashboard?payment=success`

### 2. Update Code

```typescript
// src/lib/stripe.ts

// Change from test link:
export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_XXXXXX";

// To live link:
export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/live_XXXXXX";
```

### 3. Set Up Webhook (Recommended)

See `STRIPE_WEBHOOK_SETUP.md` for automatic database updates.

## Troubleshooting

### ❌ "Cannot find STRIPE_PAYMENT_LINK"

**Problem:** The constant is not exported

**Solution:**

1. Check `src/lib/stripe.ts` line 13
2. Make sure it's exported: `export const STRIPE_PAYMENT_LINK = '...'`
3. Restart dev server: `npm run dev`

### ❌ Clicking "Subscribe Now" does nothing

**Problem:** Payment Link URL is not set or incorrect

**Solution:**

1. Check the URL in `src/lib/stripe.ts`
2. Should look like: `https://buy.stripe.com/test_...`
3. Test the URL by pasting in browser - should open Stripe checkout

### ❌ Payment succeeds but still shows payment modal

**Problem:** Database not updated with subscription

**Solution:**

1. Go to Supabase → user_profiles table
2. Find your user
3. Update `subscription_status` to `active`
4. Or set up webhook (see `STRIPE_WEBHOOK_SETUP.md`)

### ❌ "Payment not found" after redirect

**Problem:** Success URL doesn't match

**Solution:**

1. Go to Stripe Dashboard → Payment Links
2. Click your Payment Link
3. Check "After payment" success URL
4. Should be: `http://localhost:5174/dashboard?payment=success`

## What Each Part Does

### Payment Link (Stripe-hosted)

```
https://buy.stripe.com/test_XXXXXX
```

- Hosted by Stripe (not your server)
- Handles all payment details
- PCI compliant automatically
- Mobile responsive
- Secure and trusted

### URL Parameters

```
?prefilled_email=user@example.com&client_reference_id=user_abc123
```

- `prefilled_email`: Auto-fills user's email
- `client_reference_id`: Tracks which user paid (for webhook)

### Success URL

```
http://localhost:5174/dashboard?payment=success
```

- Where Stripe redirects after payment
- `?payment=success` helps you show confirmation message

## Checklist

- [ ] Created Payment Link in Stripe Dashboard
- [ ] Copied Payment Link URL
- [ ] Added URL to `src/lib/stripe.ts`
- [ ] Tested with trial (free meal plan)
- [ ] Tested payment modal appears
- [ ] Tested redirect to Stripe
- [ ] Completed test payment
- [ ] Redirected back to app
- [ ] Updated database manually
- [ ] Tested unlimited access works

## Next Steps

1. ✅ Complete this visual guide
2. ⚠️ (Optional) Set up webhook - see `STRIPE_WEBHOOK_SETUP.md`
3. ⚠️ (Before launch) Create live Payment Link
4. ⚠️ (Before launch) Replace test URL with live URL

---

**Time Required:** 15 minutes  
**Difficulty:** Easy  
**Backend Needed:** No  
**Works Immediately:** Yes! ✅
