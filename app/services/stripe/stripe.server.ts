import Stripe from 'stripe'

let stripe: Stripe | null = null
if (!!process.env.STRIPE_SECRET_KEY) {
	stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
		apiVersion: '2024-09-30.acacia',
		typescript: true,
	})
}

export { stripe }
