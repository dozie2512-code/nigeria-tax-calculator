/**
 * Firebase Cloud Functions for Nigeria Tax Calculator
 * Handles Stripe Checkout and Webhook processing
 * 
 * SETUP INSTRUCTIONS:
 * 1. Set Stripe configuration using Firebase CLI:
 *    firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."
 * 
 * 2. For local emulator testing, download the config to a local file:
 *    firebase functions:config:get > .runtimeconfig.json
 * 
 * 3. Deploy to Firebase:
 *    firebase deploy --only functions
 * 
 * IMPORTANT: Never commit API keys or secrets to the repository!
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

// Initialize Firebase Admin
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

/**
 * Initialize Stripe with secret key from functions config
 * Returns null if config is not set
 */
function getStripeInstance() {
  const config = functions.config();
  
  if (!config.stripe || !config.stripe.secret_key) {
    console.error('Stripe secret_key not configured. Please run: firebase functions:config:set stripe.secret_key="sk_test_..."');
    return null;
  }
  
  return new Stripe(config.stripe.secret_key);
}

/**
 * Get webhook secret from functions config
 * Returns null if config is not set
 */
function getWebhookSecret() {
  const config = functions.config();
  
  if (!config.stripe || !config.stripe.webhook_secret) {
    console.error('Stripe webhook_secret not configured. Please run: firebase functions:config:set stripe.webhook_secret="whsec_..."');
    return null;
  }
  
  return config.stripe.webhook_secret;
}

/**
 * HTTP Cloud Function: Create Stripe Checkout Session
 * 
 * Accepts POST request with JSON body:
 * {
 *   userId: string,
 *   userEmail: string,
 *   plan: string,
 *   price: number (in Naira),
 *   includeAddon: boolean,
 *   successUrl: string,
 *   cancelUrl: string
 * }
 * 
 * Returns: { sessionId: string }
 */
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  cors({ origin: true })(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // Get Stripe instance
    const stripe = getStripeInstance();
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set stripe.secret_key in functions config.' 
      });
    }

    try {
      // Parse request body
      const { userId, userEmail, plan, price, includeAddon, successUrl, cancelUrl } = req.body;

      // Validate required fields
      if (!userId || !userEmail || !plan || !price || !successUrl || !cancelUrl) {
        return res.status(400).json({ 
          error: 'Missing required fields: userId, userEmail, plan, price, successUrl, cancelUrl' 
        });
      }

      // Validate price is a positive number
      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ 
          error: 'Price must be a positive number in Naira' 
        });
      }

      // Convert price from Naira to kobo (smallest currency unit)
      // Stripe expects amounts in the smallest currency unit (100 kobo = 1 Naira)
      const amountInKobo = Math.round(price * 100);

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'ngn',
              product_data: {
                name: `${plan} Plan`,
                description: includeAddon 
                  ? `${plan} subscription with addon` 
                  : `${plan} subscription`,
              },
              unit_amount: amountInKobo,
            },
            quantity: 1,
          },
        ],
        customer_email: userEmail,
        metadata: {
          userId: userId,
          plan: plan,
          includeAddon: String(includeAddon),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // Return session ID
      return res.status(200).json({ sessionId: session.id });

    } catch (error) {
      console.error('Error creating checkout session:', error);
      return res.status(500).json({ 
        error: 'Failed to create checkout session',
        message: error.message 
      });
    }
  });
});

/**
 * HTTP Cloud Function: Stripe Webhook Handler
 * 
 * Handles Stripe webhook events with signature verification
 * Processes checkout.session.completed events to update user subscriptions
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Get Stripe instance and webhook secret
  const stripe = getStripeInstance();
  const webhookSecret = getWebhookSecret();

  if (!stripe) {
    console.error('Stripe not configured');
    return res.status(500).send('Stripe is not configured');
  }

  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return res.status(500).send('Webhook secret is not configured');
  }

  try {
    // Get the signature from headers
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      console.error('No signature found in request headers');
      return res.status(400).send('No signature found');
    }

    // Get the raw body for signature verification
    // Firebase Functions provides rawBody, fallback to constructing from JSON
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

    // Verify webhook signature and construct event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    console.log('Processing webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extract metadata
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      const includeAddon = session.metadata.includeAddon === 'true';

      if (!userId || !plan) {
        console.error('Missing userId or plan in session metadata');
        return res.status(400).send('Invalid session metadata');
      }

      // Calculate expiration date (365 days from now)
      const now = admin.firestore.Timestamp.now();
      const expirationDate = new Date(now.toDate());
      expirationDate.setDate(expirationDate.getDate() + 365);

      // Update user document in Firestore
      const userRef = db.collection('users').doc(userId);
      
      await userRef.set({
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        subscriptionIncludesAddon: includeAddon,
        subscriptionActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(expirationDate),
      }, { merge: true });

      console.log(`Subscription activated for user ${userId} with plan ${plan}`);
    }

    // Return success response
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).send(`Webhook processing failed: ${error.message}`);
  }
});
