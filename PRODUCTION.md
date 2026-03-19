# Production Setup Guide

This document describes how to configure, deploy, and operate the Nigeria Tax Calculator for a live customer base.

---

## Table of Contents

1. [Firebase Project Setup](#1-firebase-project-setup)
2. [Providing the Firebase Config](#2-providing-the-firebase-config)
3. [Firestore Data Structure](#3-firestore-data-structure)
4. [Firestore Security Rules](#4-firestore-security-rules)
5. [Cloud Sync Module](#5-cloud-sync-module)
6. [Subscription / Entitlement Model (Phase 2)](#6-subscription--entitlement-model-phase-2)
7. [Deploy Checklist](#7-deploy-checklist)

---

## 1. Firebase Project Setup

### 1.1 Create a Firebase project

1. Go to <https://console.firebase.google.com> and create a **new project**.
2. Use separate projects for **dev/staging** and **production** — never share credentials.

### 1.2 Enable Authentication

1. In the Firebase Console → **Authentication** → **Sign-in method**.
2. Enable **Email/Password**.

### 1.3 Create a Firestore database

1. **Firestore Database** → **Create database**.
2. Choose **production mode** (rules deployed separately — see §4).
3. Select the region closest to your customers (e.g. `europe-west2` for UK, `us-central1` for US).

### 1.4 (Optional) Enable App Check

For additional protection against abuse, enable **App Check** with reCAPTCHA v3:

- **App Check** → **Get started** → register your web app.
- This prevents unauthorized clients from calling Firestore.

---

## 2. Providing the Firebase Config

Real credentials must **never** be committed to source control.

### 2.1 Create `config.js`

Copy `config.example.js` to `config.js` in the repository root and fill in your project credentials:

```bash
cp config.example.js config.js
# Edit config.js with your values from Firebase Console
```

`config.js` is listed in `.gitignore` and will never be committed.

### 2.2 How it works

`index.html` loads `config.js` via an optional `<script>` tag with an `onerror` handler.
When the file is present, it sets `window.__FIREBASE_CONFIG__` which the app reads at startup.
When it is absent (e.g. in a fresh clone), the app falls back to **demo / local mode** — all features work with `localStorage` only.

```html
<!-- optional — provides window.__FIREBASE_CONFIG__ -->
<script src="config.js" onerror="console.info('[config] config.js not found – running in demo mode')"></script>
```

### 2.3 GitHub Pages / CI deployment

For automated deployments (GitHub Actions, Netlify, Vercel, etc.) inject the config via a build step:

```bash
# Example: generate config.js from environment variables in CI
cat > config.js <<EOF
window.__FIREBASE_CONFIG__ = {
  apiKey: "$FIREBASE_API_KEY",
  authDomain: "$FIREBASE_AUTH_DOMAIN",
  projectId: "$FIREBASE_PROJECT_ID",
  storageBucket: "$FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "$FIREBASE_MESSAGING_SENDER_ID",
  appId: "$FIREBASE_APP_ID"
};
EOF
```

Store the values as **repository secrets** (GitHub: Settings → Secrets and variables → Actions).

---

## 3. Firestore Data Structure

```
users/{uid}
  email            string
  displayName      string
  createdAt        timestamp
  lastLoginAt      timestamp
  migrationComplete boolean    ← set after localStorage migration

businesses/{businessId}
  id               string
  name             string
  entity           string      (Business | Company | Enterprise)
  ownerUid         string      ← Firebase uid of the creator
  currency         string      (NGN | GBP)
  vatRate          number
  whtRate          number
  citRate          number
  vatEnabled       boolean
  payeEnabled      boolean
  pitEnabled       boolean
  citEnabled       boolean
  periodStart      string | null
  periodEnd        string | null
  createdAt        timestamp
  updatedAt        timestamp

businesses/{businessId}/members/{uid}
  uid              string      ← Firebase uid
  role             string      (owner | admin | member | accountant)
  addedAt          timestamp

businesses/{businessId}/transactions/{txnId}
  id               string
  date             string
  action           string      (Revenue | Expense | Inventory* | Asset* | …)
  accountId        string
  accountName      string
  accountCategory  string
  description      string
  amount           number
  vatType          string
  whtApplied       boolean
  whtRate          number
  paye             boolean
  contact          string
  paymentStatus    string
  receiptId        string | null
  _syncedAt        timestamp   ← set by cloud-sync.js

businesses/{businessId}/billing/subscription
  plan             string      (Business | Company | Enterprise | Enterprise Plus)
  status           string      (active | trialing | past_due | canceled)
  stripeCustomerId       string
  stripeSubscriptionId   string
  currentPeriodEnd       timestamp
  updatedAt              timestamp
  ← written only by Cloud Functions (Admin SDK); client read-only
```

### Data isolation guarantee

Every query that reads business data requires the caller to be listed in
`businesses/{businessId}/members/{uid}`. This is enforced at the Firestore
Security Rules layer (see §4) — it cannot be bypassed from the client.

---

## 4. Firestore Security Rules

The file `firestore.rules` (in the repository root) contains the complete ruleset.

### Deploy the rules

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Authenticate
firebase login

# Set your project
firebase use YOUR_PROJECT_ID

# Deploy rules only
firebase deploy --only firestore:rules
```

### Key principles

| Collection | Read | Write | Notes |
|---|---|---|---|
| `users/{uid}` | Owner only | Owner only | No hard deletes |
| `businesses/{businessId}` | Members only | Members only | Deactivate via status |
| `.../members/{uid}` | Members | Members | Owner adds self on create |
| `.../transactions/{txnId}` | Members | Members | |
| `.../billing/subscription` | Members | **Denied** | Backend (Admin SDK) only |

---

## 5. Cloud Sync Module

`cloud-sync.js` provides the Firestore persistence layer as a browser module
(`window.cloudSync`). It is loaded by `index.html` and called by the existing
transaction add/edit/delete handlers.

### Public API

```js
// Feature flag — set false to disable all Firestore writes
cloudSync.enabled = true | false;

// Business
await cloudSync.syncBusiness(business, ownerUid);
await cloudSync.loadUserBusinesses(uid);       // → business[]

// Transactions
await cloudSync.syncTransaction(businessId, txn);
await cloudSync.deleteTransaction(businessId, txnId);
await cloudSync.loadTransactions(businessId);  // → txn[]

// Migration (localStorage → Firestore, one-time)
await cloudSync.isMigrationComplete(uid);      // → boolean
await cloudSync.migrateLocalToCloud(localUserId, firebaseUid, appState);

// Called on sign-in — merges cloud data and checks migration need
cloudSync.onUserSignedIn(firebaseUid, localUserId, appState, callback);

// Entitlements
await cloudSync.getEffectivePlan(businessId);       // → {plan, status, currentPeriodEnd}
await cloudSync.isFeatureEnabled(featureName, businessId); // → boolean
```

### Firestore index required

The `loadUserBusinesses` function uses a **collection-group query** on the
`members` sub-collection. You must deploy the following composite index:

```
Collection group : members
Field            : uid  (Ascending)
```

Firebase will prompt you to create this automatically the first time the query
runs in the browser console. Alternatively, add it in
`firestore.indexes.json` and deploy with `firebase deploy --only firestore:indexes`.

---

## 6. Subscription / Entitlement Model (Phase 2)

### Current state (Phase 1)

- The "Subscribe" button in the pricing cards is a placeholder.
- `cloudSync.getEffectivePlan()` reads `businesses/{id}/billing/subscription`.
- When the doc is absent, the plan defaults to `demo` which is **permissive** — all features remain accessible. This lets the app work for existing customers without disruption.

### Phase 2 implementation plan

1. **Stripe Checkout** — replace the subscribe button with a call to a Firebase
   Cloud Function (`createCheckoutSession`) that creates a Stripe Checkout Session
   in **subscription mode** (yearly pricing).
2. **Stripe Webhook** — Cloud Function (`stripeWebhook`) handles
   `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`,
   and `customer.subscription.deleted` events.
3. **Entitlement write** — the webhook writes to
   `businesses/{businessId}/billing/subscription` using the Admin SDK.
4. **Client enforcement** — `isFeatureEnabled()` will then reflect real
   subscription status and gate Enterprise/Company-only features accordingly.

See `functions/index.js` and `functions/README.md` for the Cloud Functions skeleton.

---

## 7. Deploy Checklist

### Before first production deploy

- [ ] Firebase project created (separate from dev)
- [ ] Email/Password authentication enabled
- [ ] Firestore database created in production mode
- [ ] `config.js` generated with production credentials (or CI secrets configured)
- [ ] `firestore.rules` deployed (`firebase deploy --only firestore:rules`)
- [ ] Firestore `members` collection-group index created
- [ ] (Optional) App Check configured
- [ ] Stripe yearly price IDs created for Business / Company / Enterprise plans
- [ ] Cloud Functions deployed with Stripe secrets configured
  ```bash
  firebase functions:config:set stripe.secret_key="sk_live_..." stripe.webhook_secret="whsec_..."
  firebase deploy --only functions
  ```
- [ ] Stripe webhook endpoint registered pointing to `stripeWebhook` Cloud Function URL
- [ ] Domain/hosting configured (GitHub Pages / Firebase Hosting / Netlify)
- [ ] HTTPS enforced (all static hosts enforce this automatically)

### Ongoing operations

- [ ] Weekly Firestore exports scheduled (Firebase Console → Firestore → Import/Export)
- [ ] Error tracking configured (e.g. Sentry for JS errors)
- [ ] Firebase usage alerts set (Console → Project Settings → Usage and billing)
- [ ] Review Firebase Auth activity dashboard for anomalies monthly
