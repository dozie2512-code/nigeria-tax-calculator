import Stripe from 'stripe'
import type { Config, Context } from '@netlify/functions'

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed. Use POST.' }, { status: 405 })
  }

  const secretKey = Netlify.env.get('STRIPE_SECRET_KEY')
  if (!secretKey) {
    return Response.json(
      { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in the Netlify environment.' },
      { status: 500 },
    )
  }

  let payload: {
    userId?: string
    userEmail?: string
    plan?: string
    price?: number
    includeAddon?: boolean
    successUrl?: string
    cancelUrl?: string
  }

  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { userId, userEmail, plan, price, includeAddon, successUrl, cancelUrl } = payload

  if (!userId || !userEmail || !plan || !price || !successUrl || !cancelUrl) {
    return Response.json(
      { error: 'Missing required fields: userId, userEmail, plan, price, successUrl, cancelUrl' },
      { status: 400 },
    )
  }

  if (typeof price !== 'number' || price <= 0) {
    return Response.json({ error: 'Price must be a positive number in Naira' }, { status: 400 })
  }

  const stripe = new Stripe(secretKey)
  const amountInKobo = Math.round(price * 100)

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'ngn',
            product_data: {
              name: `${plan} Plan`,
              description: includeAddon ? `${plan} subscription with addon` : `${plan} subscription`,
            },
            unit_amount: amountInKobo,
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        userId,
        plan,
        includeAddon: String(Boolean(includeAddon)),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return Response.json({ sessionId: session.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating checkout session:', message)
    return Response.json({ error: 'Failed to create checkout session', message }, { status: 500 })
  }
}

export const config: Config = {
  path: '/api/create-checkout-session',
  method: 'POST',
}
