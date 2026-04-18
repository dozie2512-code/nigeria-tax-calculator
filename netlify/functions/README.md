# Netlify Functions — Nigeria Tax Calculator

Serverless endpoints for Stripe Checkout and webhook processing. These functions replace the previous Firebase Cloud Functions implementation.

## Endpoints

### `POST /api/create-checkout-session`

Creates a Stripe Checkout Session for one-time payments in NGN.

**Body:**
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

`price` is in Naira and is converted to kobo automatically. Metadata (`userId`, `plan`, `includeAddon`) is attached to the Stripe session so the webhook can activate the right subscription.

**Response:** `{ "sessionId": "cs_test_..." }`

### `POST /api/stripe-webhook`

Receives Stripe webhook events. Verifies the signature and, on `checkout.session.completed`, writes the subscription record to Netlify Blobs (store `subscriptions`, key `{userId}`) with a 365-day expiry.

Record shape:

```json
{
  "userId": "user123",
  "subscriptionStatus": "active",
  "subscriptionPlan": "Premium",
  "subscriptionIncludesAddon": true,
  "subscriptionActivatedAt": "2026-04-18T00:00:00.000Z",
  "subscriptionExpiresAt": "2027-04-18T00:00:00.000Z",
  "stripeSessionId": "cs_test_..."
}
```

Configure the webhook in Stripe to post to the deployed URL and send `checkout.session.completed` events.

## Environment variables

Set in the Netlify UI (Site settings → Environment variables) or via the Netlify CLI:

- `STRIPE_SECRET_KEY` — Stripe secret key (`sk_live_...` or `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` — Signing secret for the webhook endpoint (`whsec_...`)

## Local development

From the site root:

```bash
netlify dev
```

The functions are served at `http://localhost:8888/api/create-checkout-session` and `http://localhost:8888/api/stripe-webhook`. Netlify Blobs is emulated automatically; run at least one production deploy first so the site has a Blobs context.
