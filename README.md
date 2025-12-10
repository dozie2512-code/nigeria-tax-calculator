# Nigeria Tax Calculator

A comprehensive tax calculation and accounting prototype for Nigerian individuals and businesses.

## Features

- Tax calculations for VAT, WHT, PAYE, PIT, CIT, and CGT
- Inventory and asset management
- Multi-user authentication with Firebase
- Payment integration with Stripe and Paystack
- Financial reports and exports
- Audit trail functionality

## Configuring Payment Keys

**⚠️ IMPORTANT SECURITY NOTICE**

### If You Have Previously Committed API Keys

If any API keys or secrets were previously committed to this repository:

1. **Immediately revoke and rotate all exposed keys** in your provider dashboards:
   - Firebase: https://console.firebase.google.com/ → Project Settings → Service Accounts
   - Stripe: https://dashboard.stripe.com/apikeys
   - Paystack: https://dashboard.paystack.com/settings/developer

2. **Generate new keys** to replace the exposed ones

3. **(Optional but Recommended)** Rewrite git history to remove secrets from previous commits:
   - Use tools like `git-filter-repo` or `BFG Repo-Cleaner`
   - Warning: This requires force-pushing and coordinating with all repository collaborators
   - See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

### Setting Up API Keys for Development

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and replace all placeholder values** with your actual API keys:
   - Get Firebase credentials from [Firebase Console](https://console.firebase.google.com/)
   - Get Stripe publishable key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Get Paystack public key from [Paystack Dashboard](https://dashboard.paystack.com/settings/developer)

3. **Never commit the `.env` file** - it's already listed in `.gitignore`

### Security Best Practices

- ✅ **DO** store API keys in environment variables or server-side configuration
- ✅ **DO** use publishable/public keys for client-side code (keys starting with `pk_` for Stripe)
- ✅ **DO** keep secret keys (starting with `sk_`) on the server only
- ✅ **DO** rotate keys immediately if they are exposed
- ✅ **DO** use different keys for development/testing vs production

- ❌ **DON'T** commit `.env` files to version control
- ❌ **DON'T** hardcode API keys directly in source code
- ❌ **DON'T** share secret keys in chat, email, or screenshots
- ❌ **DON'T** use production keys for local development

### Build-Time Environment Injection

For production deployments, inject environment variables at build time:

```bash
# Example: Using environment variables in your build process
STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY \
FIREBASE_API_KEY=$FIREBASE_API_KEY \
npm run build
```

Update your build script to replace placeholders in `index.html` with actual environment variable values.

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your API keys
3. Open `index.html` in a web browser or serve with a local server
4. Sign up for an account to start using the application

## Technology Stack

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Authentication: Firebase Auth
- Database: Firebase Firestore + LocalStorage
- Payments: Stripe, Paystack
- PDF Export: jsPDF
- Excel Export: SheetJS

## Support

For questions or support, contact: salesrepng@gmail.com

## License

All rights reserved.
