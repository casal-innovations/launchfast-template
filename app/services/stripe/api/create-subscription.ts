import { type User, type Price } from '@prisma/client'
import { type Stripe } from 'stripe'
import { stripe } from '#app/services/stripe/stripe.server'

export async function createStripeSubscription(
	customerId: User['customerId'],
	price: Price['id'],
	params?: Stripe.SubscriptionCreateParams,
) {
	if (!stripe) {
		throw new Error('Stripe instance is not initialized.')
	}
	if (!customerId || !price)
		throw new Error(
			'Missing required parameters to create Stripe Subscription.',
		)

	return stripe.subscriptions.create({
		...params,
		customer: customerId,
		items: [{ price }],
	})
}
