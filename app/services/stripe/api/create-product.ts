import { type Plan } from '@prisma/client'
import { type Stripe } from 'stripe'
import { stripe } from '#app/services/stripe/stripe.server'

export async function createStripeProduct(
	product: Partial<Plan>,
	params?: Stripe.ProductCreateParams,
) {
	if (!stripe) {
		throw new Error('Stripe instance is not initialized.')
	}

	if (!product || !product.id || !product.name) {
		throw new Error(
			'Missing product, product ID or product name to create Stripe Product.',
		)
	}

	return stripe.products.create({
		...params,
		id: product.id,
		name: product.name,
		description: product.description || undefined,
	})
}
