import { loadStripe, type Stripe } from '@stripe/stripe-js'

// Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SHa8ECfCrW2nNMx4tV3yKCmCyzJU8YOTCS3DkcuVJYaNLtyfcMw2CpJPzYt106q2gQyXoBIQIWczHKkaqCiIiTJ00hRpKhkYL'

// Stripe product ID for annual subscription
export const STRIPE_PRODUCT_ID = 'prod_TE2EWoB1u1ykq0'

// Stripe Payment Link URL
// Instructions:
// 1. Go to https://dashboard.stripe.com/test/payment-links
// 2. Click "New payment link"
// 3. Select your product (prod_TE2EWoB1u1ykq0)
// 4. Set price to $29.99 one-time
// 5. Copy the Payment Link URL and paste below
// 
// Note: The app automatically appends these query parameters:
// - prefilled_email: Pre-fills customer email
// - client_reference_id: User ID for webhook processing and database updates
// - success_url: Redirects back to dashboard after successful payment
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_7sY00i59l9TW1Ekg6n7g400' // Replace with your actual Payment Link

// Singleton instance of Stripe
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}
