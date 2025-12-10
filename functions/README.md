# Firebase Cloud Functions - Nigeria Tax Calculator

This directory contains Firebase Cloud Functions for handling Stripe Checkout and webhook processing for the Nigeria Tax Calculator application.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Stripe Secrets

**IMPORTANT: Never commit API keys or secrets to the repository!**

Set your Stripe API keys using Firebase CLI:

```bash
firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."
```

Replace `sk_test_...` with your Stripe secret key and `whsec_...` with your Stripe webhook secret.

### 3. Local Development with Emulator

For local testing, download the config to a local file:

```bash
firebase functions:config:get > .runtimeconfig.json
```

**Note:** The `.runtimeconfig.json` file is automatically excluded from git via `.gitignore`.

Start the Firebase emulator:

```bash
npm run start
```

Or:

```bash
firebase emulators:start --only functions
```

### 4. Deploy to Firebase

Deploy the functions to Firebase:

```bash
npm run deploy
```

Or:

```bash
firebase deploy --only functions
```

## Functions

### createCheckoutSession

HTTP endpoint that creates a Stripe Checkout Session for payment processing.

**Endpoint:** `https://<region>-<project-id>.cloudfunctions.net/createCheckoutSession`

**Method:** POST

**Request Body:**
```json
{
  "userId": "user123",
  "userEmail": "user@example.com",
  "plan": "Premium",
  "price": 20000,
  "includeAddon": true,
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_..."
}
```

**Notes:**
- `price` should be in Naira (e.g., 20000 for ₦20,000)
- The function converts the price to kobo (smallest currency unit) automatically
- The session uses `mode: 'payment'` for one-time payments
- Metadata (userId, plan, includeAddon) is attached to the session for webhook processing

### stripeWebhook

HTTP endpoint that handles Stripe webhook events with signature verification.

**Endpoint:** `https://<region>-<project-id>.cloudfunctions.net/stripeWebhook`

**Method:** POST

**Handled Events:**
- `checkout.session.completed`: Updates user subscription status in Firestore

**Firestore Update (on successful checkout):**
- Collection: `users`
- Document ID: `{userId}` (from session metadata)
- Fields updated:
  - `subscriptionStatus`: 'active'
  - `subscriptionPlan`: plan name from metadata
  - `subscriptionIncludesAddon`: boolean from metadata
  - `subscriptionActivatedAt`: server timestamp
  - `subscriptionExpiresAt`: server timestamp + 365 days

**Webhook Configuration:**
1. Go to your Stripe Dashboard → Developers → Webhooks
2. Add endpoint with the Cloud Function URL
3. Select events to send: `checkout.session.completed`
4. Copy the webhook signing secret and configure it using Firebase CLI (see Setup step 2)

## Security

- All Stripe secrets are stored in Firebase Functions config, not in code
- Webhook signature verification ensures requests are from Stripe
- CORS is enabled for the checkout session endpoint
- Raw request body is used for webhook signature verification
- All sensitive configuration is excluded from git via `.gitignore`

## Reminder

**DO NOT commit API keys, secrets, or the `.runtimeconfig.json` file to the repository!**

All secrets should be managed through Firebase Functions config.
