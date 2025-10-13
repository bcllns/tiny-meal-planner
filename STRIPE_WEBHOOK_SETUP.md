# Stripe Webhook Setup (Optional)

This guide shows how to automatically update your database when a payment succeeds using Stripe webhooks.

## Why Use Webhooks?

Without webhooks, you need to manually update the database after each payment. Webhooks automate this process.

**Manual Update:**

- User pays → You manually update Supabase → User can use app

**With Webhook:**

- User pays → Stripe calls webhook → Database auto-updates → User can use app immediately

## Option 1: Supabase Edge Function (Recommended)

### Step 1: Create the Edge Function

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Create webhook function
supabase functions new stripe-webhook
```

### Step 2: Add the Code

Create/edit `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    // Get signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature (simplified - use Stripe library in production)
    // For now, we'll just parse the event
    const event = JSON.parse(body);

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const customerEmail = session.customer_email;

      if (userId) {
        // Update user subscription
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        await supabase
          .from("user_profiles")
          .update({
            subscription_status: "active",
            stripe_customer_id: session.customer,
            subscription_id: session.id,
            subscription_end_date: oneYearFromNow.toISOString(),
          })
          .eq("user_id", userId);

        console.log(`Updated subscription for user: ${userId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
});
```

### Step 3: Deploy the Function

```bash
# Set environment variables
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Deploy
supabase functions deploy stripe-webhook

# Get the URL (something like):
# https://your-project.supabase.co/functions/v1/stripe-webhook
```

### Step 4: Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Events: Select `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the webhook signing secret (starts with `whsec_`)
7. Update in Supabase: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

## Option 2: Simple HTTP Endpoint (Any Platform)

If you have any backend (Express, Next.js API routes, Netlify Functions, etc.), you can create a simple endpoint:

```typescript
// Example: Next.js API route at /api/stripe-webhook.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;

      if (userId) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        await supabase
          .from("user_profiles")
          .update({
            subscription_status: "active",
            stripe_customer_id: session.customer,
            subscription_id: session.id,
            subscription_end_date: oneYearFromNow.toISOString(),
          })
          .eq("user_id", userId);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook failed" });
  }
}
```

## Testing the Webhook

### Test in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Click "Send test webhook"
6. Check your Supabase database - subscription should be updated!

### Test with Real Payment

1. Use your app to make a test payment
2. Complete payment with test card: 4242 4242 4242 4242
3. Check Stripe Dashboard → Webhooks → Click your endpoint
4. You should see the webhook delivery in the logs
5. Check Supabase → user_profiles table
6. The user's subscription_status should be 'active'

## Troubleshooting

### Webhook not receiving events

- Check the webhook URL is correct
- Make sure endpoint is publicly accessible
- Verify webhook is enabled in Stripe Dashboard

### Database not updating

- Check Supabase logs for errors
- Verify SUPABASE_SERVICE_ROLE_KEY is set (not anon key)
- Check user_id matches in both Stripe and Supabase

### "Invalid signature" error

- Verify STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
- Make sure you're using the raw request body (not parsed JSON)

## Production Considerations

1. **Use Stripe library for signature verification:**

   ```typescript
   import Stripe from "stripe";
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
   const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
   ```

2. **Add error handling and logging**
3. **Use environment variables for all secrets**
4. **Test thoroughly in test mode before going live**
5. **Monitor webhook deliveries in Stripe Dashboard**

## Without Webhooks (Manual Process)

If you don't want to set up webhooks, you can manually update subscriptions:

1. User completes payment
2. Go to Stripe Dashboard → Payments
3. Find the payment → Note the customer email
4. Go to Supabase → user_profiles table
5. Find user by email
6. Update:
   - `subscription_status = 'active'`
   - `subscription_end_date = (1 year from now)`
   - `stripe_customer_id = (from Stripe)`

This works fine for low-volume apps or testing!

## Next Steps

- Set up webhook (this document)
- Test with a payment
- Monitor webhook deliveries
- Set up error alerting
- Deploy to production

---

**Complexity:** Medium (one-time setup)  
**Benefit:** Automatic database updates  
**Required:** No (manual updates work too)
