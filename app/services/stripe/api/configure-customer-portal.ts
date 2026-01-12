import { appName } from '#app/utils/constants.js'
import { objectToQueryString } from '#app/utils/query-string.js'
import { type PlanId } from '../plans'

type BillingPortalProducts = {
	product: PlanId
	prices: string[]
}

export async function configureStripeCustomerPortal(
	products: BillingPortalProducts[],
) {
	if (!products)
		throw new Error(
			'Missing required parameters to configure Stripe Customer Portal.',
		)

	// Filter out free products
	const filteredProducts = products.filter(({ product }) => product !== 'free')

	// Create the payload for the request
	const body = {
		business_profile: {
			headline: `${appName} - Customer Portal`,
		},
		features: {
			customer_update: {
				enabled: true,
				allowed_updates: ['address', 'shipping', 'tax_id', 'email'],
			},
			invoice_history: { enabled: true },
			payment_method_update: { enabled: true },
			subscription_cancel: { enabled: true },
			subscription_update: {
				enabled: true,
				default_allowed_updates: ['price'],
				proration_behavior: 'always_invoice',
				products: filteredProducts,
			},
		},
	}

	// Make the fetch request to the Stripe API with JSON
	return await fetch(
		'https://api.stripe.com/v1/billing_portal/configurations',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: objectToQueryString(body),
		},
	)
}
