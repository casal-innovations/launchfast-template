import { type Stripe } from 'stripe'
import { stripe } from '#app/services/stripe/stripe.server'

export async function createStripeCustomer(
	customer?: Stripe.CustomerCreateParams,
) {
	if (!stripe) {
		throw new Error('Stripe instance is not initialized.')
	}
	if (!customer) throw new Error('No customer data provided.')
	return stripe.customers.create(customer)
}
