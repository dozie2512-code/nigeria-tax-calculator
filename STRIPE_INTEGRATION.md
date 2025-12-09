# Stripe Checkout + Firebase Integration

This integration enables converting 7-day trial users to 1-year subscriptions via Stripe Checkout.

## Architecture

```
Client (index.html)
    ↓
    1. User clicks "Buy Now"
    ↓
    2. createStripeCheckoutSession() calls Cloud Function
    ↓
Firebase Cloud Function (createCheckoutSession)
    ↓
    3. Creates Stripe Checkout Session
    ↓
Stripe Checkout Page
    ↓
    4. User completes payment
    ↓
Stripe Webhook → Cloud Function (stripeWebhook)
    ↓
    5. Updates Firestore with subscription details
    ↓
Firestore Listener (client-side)
    ↓
    6. Detects subscription activation
    ↓
    7. Updates local user state & shows notification
```

## Setup Instructions

### 1. Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project (if not already done)
firebase init

# Select:
# - Functions
# - Firestore
# - Hosting (optional)
```

### 2. Install Function Dependencies

```bash
cd functions
npm install
```

### 3. Configure Stripe Keys

Get your Stripe keys from: https://dashboard.stripe.com/apikeys

```bash
# Set Stripe secret key
firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY_HERE"

# Get webhook secret from Stripe Dashboard → Webhooks (after creating endpoint)
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET_HERE"
```

### 4. Update Client Configuration

Edit `index.html` and update:

```javascript
// Line ~407: Replace with your Stripe publishable key
var STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE';

// Line ~445: Replace with your Cloud Function URL
var cloudFunctionUrl = 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/createCheckoutSession';
```

### 5. Deploy Functions

```bash
firebase deploy --only functions
```

### 6. Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook`
4. Select event: `checkout.session.completed`
5. Copy the signing secret
6. Set it: `firebase functions:config:set stripe.webhook_secret="whsec_..."`
7. Redeploy functions if needed

### 7. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Testing

### Test Mode

1. Use Stripe test keys (`pk_test_...` and `sk_test_...`)
2. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
3. Check Firebase console → Firestore for user document updates
4. Check function logs: `firebase functions:log`

### Production

1. Replace test keys with live keys (`pk_live_...` and `sk_live_...`)
2. Update webhook endpoint in Stripe Dashboard
3. Test with real cards (or continue using test cards in test mode)

## How It Works

### Client-Side Flow

1. User clicks "Buy Now" button on any plan (Individual/Enterprise/Company)
2. JavaScript intercepts the click and calls `createStripeCheckoutSession()`
3. Function checks if user is authenticated with Firebase
4. Makes POST request to Cloud Function with plan details
5. Redirects to Stripe Checkout page
6. After payment, user returns to app with `?session_id=...` in URL
7. Firestore listener detects subscription activation
8. Shows success notification and updates local state

### Server-Side Flow

1. Cloud Function creates Stripe Checkout session with metadata
2. Stripe processes payment
3. Stripe sends webhook to `stripeWebhook` function
4. Function verifies webhook signature
5. Updates Firestore user document with:
   - `subscriptionStatus: 'active'`
   - `subscriptionPlan: 'individual'|'enterprise'|'company'`
   - `subscriptionExpiresAt: (1 year from now)`
   - `subscriptionActivatedAt: (now)`

### Firestore Document Structure

```javascript
{
  users: {
    [userId]: {
      subscriptionStatus: 'active',
      subscriptionPlan: 'individual',
      subscriptionIncludesAddon: false,
      subscriptionActivatedAt: Timestamp,
      subscriptionExpiresAt: Timestamp,
      stripeSessionId: 'cs_...',
      stripePaymentStatus: 'paid',
      lastUpdated: Timestamp
    }
  }
}
```

## Troubleshooting

### "Stripe is not initialized"
- Check that `STRIPE_PUBLISHABLE_KEY` is set correctly in index.html
- Verify the key starts with `pk_test_` or `pk_live_`
- Check browser console for errors

### "Failed to create checkout session"
- Verify Cloud Function is deployed: `firebase functions:list`
- Check function logs: `firebase functions:log`
- Ensure CORS is working (function has `Access-Control-Allow-Origin: *`)
- Verify Stripe secret key is set correctly

### Webhook not working
- Verify webhook endpoint URL is correct in Stripe Dashboard
- Check that webhook secret is set: `firebase functions:config:get`
- Look for webhook signature verification errors in function logs
- Ensure you're using the signing secret from the webhook endpoint (not API keys)

### Subscription not activating
- Check Firestore rules allow Cloud Functions to write
- Verify user document exists in Firestore
- Check function logs for errors
- Test webhook locally using Stripe CLI: `stripe listen --forward-to localhost:5001/PROJECT_ID/us-central1/stripeWebhook`

## Security Considerations

1. **Never expose secret keys**: Only use publishable keys client-side
2. **Verify webhooks**: Always verify Stripe webhook signatures
3. **Use Firestore rules**: Prevent users from editing their own subscription status
4. **HTTPS only**: Use HTTPS in production for all communications
5. **Validate inputs**: Cloud Functions should validate all inputs before processing

## Cost Estimates

### Stripe
- Processing fee: ~3.9% + ₦100 per transaction (Nigeria)
- No monthly fee for basic usage

### Firebase
- Firestore: Free tier includes 50,000 reads/day, 20,000 writes/day
- Cloud Functions: Free tier includes 2 million invocations/month
- Likely free for small to medium traffic

## Support

For issues:
1. Check Firebase console logs
2. Check Stripe Dashboard logs
3. Review browser console errors
4. Check function deployment status: `firebase functions:list`
