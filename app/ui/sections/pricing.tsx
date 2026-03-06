import { Icon } from '#app/ui/components/media/icon.tsx'
import { H2 } from '../components/typography/h2'
import { H3 } from '../components/typography/h3'

const features = [
	'Remix Framework',
	'Integrated SQLite Database',
	'Integrated Authentication',
	'Integrated Payments (with Stripe)',
	'Transactional and Marketing Email Integration',
	'Complete set of UI components',
	'SEO Integrations',
	'E2e and unit tests',
	'Linting and formatting',
	'Offline development',
	'Production-ready CD/CI pipeline',
	'Sentry Monitoring',
	'Lifetime updates',
	'Discord community',
	'Access to the private GitHub repo',
	'Discuss and shape new features',
]

const tiers = [
	{ name: 'Starter', price: '99€', highlighted: false, badge: null },
	{ name: 'Pro', price: '199€', highlighted: true, badge: 'Most popular' },
	{ name: 'Enterprise', price: '299€', highlighted: false, badge: null },
] as const

const ctaButtonClassName =
	'animate-pulse-shadow mt-6 block rounded-md bg-brand-bg px-3 py-2 text-center text-sm font-semibold leading-6 text-foreground shadow-sm hover:bg-brand-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border'

const FeatureList = () => (
	<ul
		role="list"
		className="mt-8 space-y-3 text-sm leading-6 text-muted-600 xl:mt-10"
	>
		{features.map(feature => (
			<li key={feature} className="flex gap-x-3">
				<Icon
					name="check"
					aria-hidden="true"
					className="h-6 w-5 flex-none self-auto text-brand-text"
				/>
				{feature}
			</li>
		))}
	</ul>
)

export const Pricing = () => {
	return (
		<div id="pricing" className="bg-background py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<H2 className="mx-auto text-center">
						One command line to a fully featured, secure, production-ready
						starter app.
					</H2>
				</div>
				<div className="isolate mx-auto mt-10 grid max-w-full grid-cols-3 gap-8">
					{tiers.map(tier => (
						<div
							key={tier.name}
							className={`rounded-3xl p-8 ring-2 xl:p-10 ${
								tier.highlighted
									? 'ring-brand-border-active'
									: 'ring-muted-300'
							}`}
						>
							<div className="flex items-baseline justify-between gap-x-4">
								<H3 className="mt-0">{tier.name}</H3>
								{tier.badge ? (
									<p className="rounded-full bg-brand-bg px-2.5 py-1 text-xs font-semibold leading-5 text-brand-text">
										{tier.badge}
									</p>
								) : null}
							</div>
							<p className="mt-4 text-sm leading-6 text-muted-600">
								Pay once. Build unlimited projects!
							</p>
							<p className="mt-6 flex flex-col items-baseline gap-x-1">
								<span className="text-4xl font-bold tracking-tight text-muted-900">
									{tier.price}
								</span>
								<span className="text-sm font-semibold leading-6 text-muted-600">
									One-time payment
								</span>
							</p>
							<a href="/login" className={ctaButtonClassName}>
								<Icon name="star-filled" className="text-muted-300" /> Launch
								Your App Now{' '}
								<Icon name="star-filled" className="text-muted-300" />
							</a>
							<FeatureList />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
