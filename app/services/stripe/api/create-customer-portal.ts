import { type User } from '@prisma/client'

import { stripe } from '#app/services/stripe/stripe.server'
import { getDomainUrl } from '#app/utils/misc'

export async function createStripeCustomerPortalSession(
	customerId: User['customerId'],
	request: Request,
) {
	if (!stripe) {
		throw new Error('Stripe instance is not initialized.')
	}
	const HOST_URL = getDomainUrl(request)
	if (!customerId)
		throw new Error(
			'Missing required parameters to create Stripe Customer Portal.',
		)

	const session = await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: `${HOST_URL}/stripe/create-customer-portal`,
	})
	if (!session?.url)
		throw new Error('Unable to create Stripe Customer Portal Session.')

	return session.url
}
