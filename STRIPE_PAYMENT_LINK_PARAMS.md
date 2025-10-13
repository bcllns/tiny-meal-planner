# Stripe Payment Link Query Parameters

## Overview

When users click "Subscribe Now" in the payment modal, they're redirected to a Stripe Payment Link with several query parameters to enhance the checkout experience and enable proper webhook processing.

## Payment URL Structure

```
https://buy.stripe.com/test_XXXXXXXXX
  ?prefilled_email={user_email}
  &client_reference_id={user_id}
  &success_url={dashboard_url}
```

## Query Parameters

### 1. `prefilled_email`

**Purpose:** Pre-fills the customer's email in the Stripe checkout form

**Value:** User's email address (URL encoded)

**Example:** `prefilled_email=user%40example.com`

**Benefits:**

- Better UX - user doesn't have to re-enter email
- Ensures email consistency between app and Stripe
- Reduces checkout friction

---

### 2. `client_reference_id`

**Purpose:** Links the Stripe payment to the user in your database

**Value:** User's unique ID from Supabase auth (URL encoded)

**Example:** `client_reference_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Benefits:**

- **Critical for webhooks:** Identifies which user to update when payment succeeds
- Passed to webhook events as `checkout.session.client_reference_id`
- Enables automatic subscription status updates in database

**Webhook Usage:**

```javascript
// In your webhook handler
const userId = event.data.object.client_reference_id;

// Update user_profiles table
await supabase
  .from("user_profiles")
  .update({
    subscription_status: "active",
    stripe_customer_id: customerId,
    subscription_id: subscriptionId,
  })
  .eq("user_id", userId);
```

---

### 3. `success_url`

**Purpose:** Redirects user back to your app after successful payment

**Value:** Your dashboard URL with payment success indicator (URL encoded)

**Example:** `success_url=https%3A%2F%2Fyourapp.com%2F%3Fpayment%3Dsuccess`

**Decoded:** `https://yourapp.com/?payment=success`

**Benefits:**

- Seamless return to app after payment
- Can show success message based on `?payment=success` query param
- Good UX - user knows payment was successful

---

## Implementation

### In PaymentModal.tsx

```typescript
const handleSubscribe = () => {
  // Build success redirect URL
  const successUrl = `${window.location.origin}?payment=success`;

  // Build complete payment URL with all parameters
  const paymentUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(
    userEmail
  )}&client_reference_id=${encodeURIComponent(
    userId
  )}&success_url=${encodeURIComponent(successUrl)}`;

  // Redirect to Stripe
  window.location.href = paymentUrl;
};
```

### Important Notes

1. **URL Encoding Required:** All parameter values must be URL encoded using `encodeURIComponent()`

2. **Success URL Must Be Encoded:** The `success_url` parameter value is itself a URL, so it needs double encoding:

   - First: The full URL is encoded
   - Second: It's passed as a query parameter value

3. **Client Reference ID:** Must match the user ID format in your database (UUIDs in this case)

---

## Payment Flow Diagram

```
User clicks "Subscribe Now"
        ↓
Build Payment URL with:
  - prefilled_email (user's email)
  - client_reference_id (user ID)
  - success_url (dashboard URL)
        ↓
Redirect to Stripe Payment Link
        ↓
User completes payment
        ↓
Stripe processes payment
        ↓
Stripe sends webhook event
  - Contains client_reference_id
  - Webhook updates database
        ↓
Stripe redirects to success_url
  - User lands on: yourapp.com/?payment=success
        ↓
App shows success message
User can now generate unlimited meals
```

---

## Testing

### Test the Full Flow

1. **Click Subscribe:**

   ```
   Payment Modal → "Subscribe Now" button
   ```

2. **Verify URL Parameters:**

   ```
   Check browser address bar contains:
   - prefilled_email=your-email@example.com
   - client_reference_id=user-uuid
   - success_url=encoded-dashboard-url
   ```

3. **Complete Test Payment:**

   ```
   Use test card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ```

4. **Verify Redirect:**

   ```
   After payment, should redirect to:
   http://localhost:5174/?payment=success
   ```

5. **Check Webhook (if set up):**

   ```sql
   SELECT user_id, subscription_status, stripe_customer_id
   FROM user_profiles
   WHERE user_id = 'your-user-id';

   -- Should show:
   -- subscription_status: 'active'
   -- stripe_customer_id: 'cus_xxxxx'
   ```

---

## Success URL Handling (Optional)

You can add a success message in your App.tsx:

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("payment") === "success") {
    // Show success toast/message
    toast.success("Payment successful! You now have unlimited access.");

    // Clean up URL
    window.history.replaceState({}, "", "/");
  }
}, []);
```

---

## Stripe Dashboard Configuration

### Payment Link Settings (Optional)

While query parameters override these, you can also configure defaults in Stripe Dashboard:

1. Go to: https://dashboard.stripe.com/test/payment-links
2. Edit your payment link
3. Under "After payment":
   - Set default success URL (can be overridden by query param)
4. Under "Customer information":
   - Enable "Collect email addresses" (prefilled by query param)

---

## Security Notes

1. **Client Reference ID:** Safe to expose in URL - it's a UUID, not sensitive data
2. **Success URL:** Should be your own domain to prevent redirect attacks
3. **Email:** Already public information for the user
4. **No Secrets:** Never pass API keys or secrets in query parameters

---

## Troubleshooting

### User Not Redirected After Payment

**Check:**

- Is `success_url` parameter properly URL encoded?
- Is the URL an absolute URL (includes `http://` or `https://`)?
- Does the URL match an allowed domain in Stripe settings?

### Client Reference ID Not in Webhook

**Check:**

- Is the parameter name exactly `client_reference_id` (with underscores)?
- Is the value URL encoded?
- Are you checking `checkout.session.client_reference_id` in webhook?

### Email Not Pre-filled

**Check:**

- Is the parameter name exactly `prefilled_email` (with underscores)?
- Is the email value URL encoded?
- Is "Collect email addresses" enabled in Payment Link settings?

---

## Summary

| Parameter             | Purpose                | Value         | Required             |
| --------------------- | ---------------------- | ------------- | -------------------- |
| `prefilled_email`     | Pre-fill email         | User's email  | No, but recommended  |
| `client_reference_id` | Link payment to user   | User's UUID   | **YES** for webhooks |
| `success_url`         | Redirect after payment | Dashboard URL | No, but recommended  |

**Current Implementation:** ✅ All three parameters included  
**Benefits:** Better UX + Webhook processing enabled + Seamless redirect
