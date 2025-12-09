# Firebase Cloud Functions Setup

This directory contains Firebase Cloud Functions for handling Stripe payment integration.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized
3. Stripe account with API keys

## Setup

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Set environment variables for Stripe keys:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."
   ```

3. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

## Functions

### 1. createCheckoutSession
- **Type**: HTTPS callable
- **Purpose**: Creates a Stripe Checkout session for subscription purchase
- **URL**: `https://us-central1-[PROJECT_ID].cloudfunctions.net/createCheckoutSession`

### 2. stripeWebhook
- **Type**: HTTPS webhook
- **Purpose**: Handles Stripe payment confirmation events
- **URL**: `https://us-central1-[PROJECT_ID].cloudfunctions.net/stripeWebhook`
- **Configuration**: Add this URL to your Stripe Dashboard under Webhooks

### 3. checkSubscriptionStatus
- **Type**: Callable (authenticated)
- **Purpose**: Checks current user subscription status
- **Usage**: Called from client using `firebase.functions().httpsCallable('checkSubscriptionStatus')()`

## Environment Variables

Set these using Firebase Functions config:

```bash
# Stripe Secret Key (starts with sk_test_ for test mode, sk_live_ for production)
firebase functions:config:set stripe.secret_key="sk_test_..."

# Stripe Webhook Secret (from Stripe Dashboard Webhooks section)
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

To view current config:
```bash
firebase functions:config:get
```

## Stripe Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter the webhook URL: `https://us-central1-[PROJECT_ID].cloudfunctions.net/stripeWebhook`
4. Select events to listen to: `checkout.session.completed`
5. Copy the signing secret and set it as `stripe.webhook_secret`

## Firestore Security Rules

Add these rules to your `firestore.rules` file:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read their own subscription data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only Cloud Functions can write subscription data
      allow write: if false;
    }
  }
}
```

## Testing

1. Test locally using Firebase emulators:
   ```bash
   firebase emulators:start --only functions
   ```

2. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

3. Check function logs:
   ```bash
   firebase functions:log
   ```

## Client Configuration

Update the following in `index.html`:

1. Set your Stripe publishable key:
   ```javascript
   var STRIPE_PUBLISHABLE_KEY = 'pk_test_...'; // or pk_live_... for production
   ```

2. Update the Cloud Function URL:
   ```javascript
   var cloudFunctionUrl = 'https://us-central1-[PROJECT_ID].cloudfunctions.net/createCheckoutSession';
   ```

Replace `[PROJECT_ID]` with your Firebase project ID.
