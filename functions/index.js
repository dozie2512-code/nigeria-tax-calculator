const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Initialize Stripe with secret key from Firebase config
const stripe = require('stripe')(functions.config().stripe.secret_key);

/**
 * Cloud Function: Create Stripe Checkout Session
 * Called from client-side to initiate payment flow
 */
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { userId, userEmail, plan, price, includeAddon, successUrl, cancelUrl } = req.body;

    if (!userId || !userEmail || !plan || !price) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: 'ngn',
            product_data: {
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - 1 Year Subscription`,
              description: includeAddon ? 'Includes Self-Filing Support' : 'Standard subscription',
            },
            unit_amount: price * 100, // Stripe expects amount in kobo (smallest currency unit)
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        plan: plan,
        includeAddon: includeAddon ? 'true' : 'false',
        subscriptionType: '1-year',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Cloud Function: Stripe Webhook Handler
 * Processes Stripe events and updates user subscription status
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      const includeAddon = session.metadata.includeAddon === 'true';

      if (!userId) {
        console.error('No userId in session metadata');
        res.status(400).send('Missing userId');
        return;
      }

      // Calculate subscription end date (1 year from now)
      const now = admin.firestore.Timestamp.now();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      const expiresTimestamp = admin.firestore.Timestamp.fromDate(expiresAt);

      // Update user document in Firestore
      await admin.firestore().collection('users').doc(userId).set({
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        subscriptionIncludesAddon: includeAddon,
        subscriptionActivatedAt: now,
        subscriptionExpiresAt: expiresTimestamp,
        stripeSessionId: session.id,
        stripePaymentStatus: session.payment_status,
        lastUpdated: now,
      }, { merge: true });

      console.log(`Subscription activated for user ${userId} - Plan: ${plan}`);
    } catch (error) {
      console.error('Error updating user subscription:', error);
      res.status(500).send('Error processing webhook');
      return;
    }
  }

  res.json({ received: true });
});

/**
 * Cloud Function: Check Subscription Status
 * Allows client to check current subscription status
 */
exports.checkSubscriptionStatus = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return {
        status: 'trial',
        plan: null,
        expiresAt: null,
      };
    }

    const userData = userDoc.data();
    const now = new Date();
    const expiresAt = userData.subscriptionExpiresAt ? userData.subscriptionExpiresAt.toDate() : null;

    // Check if subscription has expired
    if (expiresAt && expiresAt < now) {
      return {
        status: 'expired',
        plan: userData.subscriptionPlan,
        expiresAt: expiresAt,
      };
    }

    return {
      status: userData.subscriptionStatus || 'trial',
      plan: userData.subscriptionPlan || null,
      includesAddon: userData.subscriptionIncludesAddon || false,
      activatedAt: userData.subscriptionActivatedAt ? userData.subscriptionActivatedAt.toDate() : null,
      expiresAt: expiresAt,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to check subscription status');
  }
});
