import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { getSubscriptionByUserId } from '#app/models/subscription/get-subscription'
import { Interval, Currency, PRICING_PLANS } from '#app/services/stripe/plans'
import { stripe } from '#app/services/stripe/stripe.server.ts'
import { CheckoutButton } from '#app/ui/components/stripe/checkout-button.tsx'
import { Eyebrow } from '#app/ui/components/typography/eyebrow.js'
import { H1 } from '#app/ui/components/typography/h1.js'
import { requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'
import { getDefaultCurrency } from '#app/utils/locales'

export async function loader({ request }: LoaderFunctionArgs) {
	if (!stripe) {
		throw new Error('Stripe instance is not initialized.')
	}
	const userId = await requireUserId(request)

	// get user details from prisma
	const user = await prisma.user.findUniqueOrThrow({
		select: {
			id: true,
			customerId: true,
		},
		where: { id: userId },
	})

	const subscription = user.id ? await getSubscriptionByUserId(user.id) : null

	// Get client's currency.
	const defaultCurrency = getDefaultCurrency(request)

	return json({
		user,
		subscription,
		defaultCurrency,
	})
}

export default function Plans() {
	const { user, subscription, defaultCurrency } = useLoaderData<typeof loader>()
	const [planInterval, setPlanInterval] = useState<Interval | string>(
		subscription?.interval || Interval.MONTH,
	)

	return (
		<div className="flex w-full flex-col items-center justify-start px-6 md:h-full">
			{/* Header. */}
			<div className="flex flex-col items-center">
				<Eyebrow>Plans</Eyebrow>
				<H1>Select your plan</H1>
			</div>
			<div className="my-1" />

			{/* Toggler. */}
			<div className="my-4 flex flex-col items-center justify-center">
				<div className="text-center font-bold text-muted-600">
					{planInterval === Interval.MONTH ? 'Monthly' : 'Yearly'}
				</div>
				<div className="my-2" />

				<label htmlFor="toggle" className="flex cursor-pointer items-center">
					<div className="relative">
						<input
							type="checkbox"
							id="toggle"
							value=""
							className="sr-only"
							checked={planInterval === Interval.YEAR}
							onChange={() =>
								setPlanInterval(prev =>
									prev === Interval.MONTH ? Interval.YEAR : Interval.MONTH,
								)
							}
						/>
						<div className="block h-8 w-14 rounded-full bg-muted-600 opacity-40" />
						<div
							className={`dot absolute left-1 top-1 h-6 w-6 rounded-full transition ${
								planInterval === Interval.MONTH
									? 'translate-x-0 bg-white'
									: 'translate-x-6 bg-violet-400'
							}`}
						/>
					</div>
				</label>
			</div>

			{/* Plans. */}
			<div className="flex w-full max-w-6xl flex-col items-center py-3 md:flex-row md:justify-center">
				{Object.values(PRICING_PLANS).map(plan => {
					return (
						<div
							key={plan.id}
							className={`mx-2 flex min-w-[280px] flex-col items-center px-6 py-3 transition`}
						>
							{/* Name. */}
							<span className="text-2xl font-semibold text-muted-800">
								{plan.name}
							</span>
							<div className="my-3" />

							{/* Price Amount. */}
							<h5 className="flex flex-row items-center text-5xl font-bold text-muted-700">
								{defaultCurrency === Currency.EUR ? '€' : '$'}
								{planInterval === Interval.MONTH
									? plan.prices[Interval.MONTH][defaultCurrency] / 100
									: plan.prices[Interval.YEAR][defaultCurrency] / 100}
								<small className="relative left-1 top-2 text-lg text-muted-500">
									{planInterval === Interval.MONTH ? '/mo' : '/yr'}
								</small>
							</h5>
							<div className="my-3" />

							{/* Features. */}
							{plan.features.map(feature => {
								return (
									<div key={feature} className="flex flex-row items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="6 h-6 w-6 fill-green-500"
											viewBox="0 0 24 24"
										>
											<path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z" />
										</svg>
										<div className="mx-1" />
										<p className="flex flex-row whitespace-nowrap text-center text-base font-medium text-muted-400">
											{feature}
										</p>
									</div>
								)
							})}
							<div className="my-3" />

							{/* Checkout Component. */}
							{user && (
								<CheckoutButton
									currentPlanId={subscription?.planId ?? null}
									planId={plan.id}
									planName={plan.name}
									planInterval={planInterval}
								/>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
