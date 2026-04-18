import Stripe from 'stripe'
import { getStore } from '@netlify/blobs'
import type { Config, Context } from '@netlify/functions'

const SUBSCRIPTION_DAYS = 365

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const secretKey = Netlify.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Netlify.env.get('STRIPE_WEBHOOK_SECRET')

  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not configured')
    return new Response('Stripe is not configured', { status: 500 })
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return new Response('Webhook secret is not configured', { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('No signature found', { status: 400 })
  }

  const stripe = new Stripe(secretKey)
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 })
  }

  console.log('Processing webhook event:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const plan = session.metadata?.plan
    const includeAddon = session.metadata?.includeAddon === 'true'

    if (!userId || !plan) {
      console.error('Missing userId or plan in session metadata')
      return new Response('Invalid session metadata', { status: 400 })
    }

    const activatedAt = new Date()
    const expiresAt = new Date(activatedAt.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000)

    const store = getStore('subscriptions')
    await store.setJSON(userId, {
      userId,
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
      subscriptionIncludesAddon: includeAddon,
      subscriptionActivatedAt: activatedAt.toISOString(),
      subscriptionExpiresAt: expiresAt.toISOString(),
      stripeSessionId: session.id,
    })

    console.log(`Subscription activated for user ${userId} with plan ${plan}`)
  }

  return Response.json({ received: true })
}

export const config: Config = {
  path: '/api/stripe-webhook',
  method: 'POST',
}
