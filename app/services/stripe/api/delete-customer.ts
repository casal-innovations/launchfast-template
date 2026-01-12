import { type User } from '@prisma/client'
import { stripe } from '#app/services/stripe/stripe.server'

export async function deleteStripeCustomer(customerId?: User['customerId']) {
	if (!stripe) {
		throw new Error('Stripe instance is not initialized.')
	}
	if (!customerId)
		throw new Error('Missing required parameters to delete Stripe Customer.')

	return stripe.customers.del(customerId)
}
