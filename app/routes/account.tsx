import { type LoaderFunctionArgs, json, redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getSubscriptionByUserId } from '#app/models/subscription/get-subscription'
import { PlanId, PRICING_PLANS } from '#app/services/stripe/plans'
import { stripe } from '#app/services/stripe/stripe.server.ts'
import { CustomerPortalButton } from '#app/ui/components/stripe/customer-portal-button.tsx'
import { Eyebrow } from '#app/ui/components/typography/eyebrow.js'
import { H1 } from '#app/ui/components/typography/h1.js'
import { H3 } from '#app/ui/components/typography/h3.js'
import { P } from '#app/ui/components/typography/p.js'
import { requireUserId } from '#app/utils/auth.server'
import { formatUnixDate } from '#app/utils/date'
import { prisma } from '#app/utils/db.server'
import { getUserImgSrc } from '#app/utils/misc'

export async function loader({ request }: LoaderFunctionArgs) {
	if (!stripe) {
		throw new Error('Stripe instance is not initialized.')
	}
	const userId = await requireUserId(request)

	// get user details from prisma
	const user = await prisma.user.findUniqueOrThrow({
		select: {
			id: true,
			name: true,
			customerId: true,
			email: true,
			image: { select: { id: true } },
		},
		where: { id: userId },
	})

	// Redirect with the intent to setup user customer.
	if (!user.customerId) return redirect('/stripe/create-customer')

	// Redirect with the intent to setup a free user subscription.
	const subscription = await getSubscriptionByUserId(user.id)
	if (!subscription) return redirect('/stripe/create-subscription')

	return json({ user, subscription })
}

export default function Account() {
	const { user, subscription } = useLoaderData<typeof loader>()
	const userDisplayName = user.name ? user.name : user.email

	return (
		<div className="flex w-full flex-col items-center justify-start px-6 py-12 md:h-full">
			<div>
				<Eyebrow className="mx-auto text-center">User subscription</Eyebrow>
				<H1 className="mx-auto text-center">Account</H1>
			</div>

			<div className="flex w-full max-w-2xl flex-col items-center md:flex-row md:justify-evenly">
				{/* User. */}
				<div className="my-8 flex h-full w-full flex-col items-center gap-2 md:my-0">
					{/* Avatar. */}
					<img
						src={getUserImgSrc(user.image?.id)}
						alt={userDisplayName}
						className="h-20 w-20 rounded-full object-cover"
					/>
					<div className="flex flex-col items-center">
						<p className="font-bold">{user.name ? user.name : user.email}</p>
					</div>
				</div>

				{/* Subscription. */}
				<div className="flex h-full w-full flex-col items-center">
					{/* Info. */}
					<div className="flex flex-col items-center">
						<H3>
							{String(subscription.planId).charAt(0).toUpperCase() +
								subscription.planId.slice(1)}{' '}
							Plan
						</H3>
						<P>
							{subscription.planId === PlanId.FREE &&
								PRICING_PLANS[PlanId.FREE].description}

							{subscription.planId === PlanId.STARTER &&
								PRICING_PLANS[PlanId.STARTER].description}

							{subscription.planId === PlanId.PRO &&
								PRICING_PLANS[PlanId.PRO].description}
						</P>
					</div>
					<div className="my-3" />

					{/* Plans Link. */}
					{subscription.planId === PlanId.FREE && (
						<>
							<Link
								to="/plans"
								prefetch="intent"
								className="flex h-10 w-48 flex-row items-center justify-center rounded-xl bg-violet-500 px-6 font-bold text-gray-100 transition hover:scale-105 hover:brightness-125 active:opacity-80"
							>
								Subscribe
							</Link>
							<div className="my-1" />
						</>
					)}

					{/* Customer Portal. */}
					{user.customerId && <CustomerPortalButton />}

					{/* Expire / Renew Date. */}
					{subscription.planId !== PlanId.FREE ? (
						<div className="max-w-[200px]">
							<div className="my-6" />
							<p className="text-center text-xs font-semibold text-muted-600">
								Your subscription{' '}
								{subscription.cancelAtPeriodEnd === true ? (
									<span className="text-red-500">expires</span>
								) : (
									<span className="text-green-500">renews</span>
								)}{' '}
								on:{' '}
								<span className="text-muted-400">
									{subscription &&
										formatUnixDate(subscription.currentPeriodEnd)}
								</span>
							</p>
						</div>
					) : (
						<div className="max-w-sm">
							<div className="my-6" />
							<p className="text-center text-sm font-semibold text-muted-600">
								Your Free Plan is{' '}
								<span className="text-green-500">unlimited</span>.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
