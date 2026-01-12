import { type User, type Price } from '@prisma/client'
import { type Stripe } from 'stripe'
import { getDomainUrl } from '#app/utils/misc'
import { objectToQueryString } from '#app/utils/query-string.js'

export async function createStripeCheckoutSession(
	customerId: User['customerId'],
	priceId: Price['id'],
	request: Request,
	params?: Stripe.Checkout.SessionCreateParams,
) {
	const HOST_URL = getDomainUrl(request)
	if (!customerId || !priceId)
		throw new Error(
			'Missing required parameters to create Stripe Checkout Session.',
		)

	const body = {
		customer: customerId,
		line_items: [{ price: priceId, quantity: 1 }],
		mode: 'subscription',
		payment_method_types: ['card'],
		success_url: `${HOST_URL}/account`,
		cancel_url: `${HOST_URL}/plans`,
		...params,
	}

	const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
		},
		body: objectToQueryString(body),
	})
	// Check for HTTP errors
	if (!response.ok) {
		const errorDetails = await response.text()
		throw new Error(`Stripe API error: ${response.status} - ${errorDetails}`)
	}
	const session = (await response.json()) as Stripe.Checkout.Session

	if (!session?.url)
		throw new Error(
			'Unable to create Stripe Checkout Session. No session URL returned.',
		)

	return session.url
}
