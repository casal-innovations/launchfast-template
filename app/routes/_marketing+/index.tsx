import { type MetaFunction } from '@remix-run/node'
import { Benefits } from '#app/ui/sections/benefits.js'
import { CTA } from '#app/ui/sections/cta.js'
import { FAQ } from '#app/ui/sections/faq.js'
import { FeaturedOn } from '#app/ui/sections/featured-on.js'
import { Hero } from '#app/ui/sections/hero.js'
import { Pricing } from '#app/ui/sections/pricing.js'
import { Problem } from '#app/ui/sections/problem.js'
import { Testimonials } from '#app/ui/sections/testimonials.js'
import { appName } from '#app/utils/constants.ts'

export const meta: MetaFunction = () => [{ title: appName }]

export default function Index() {
	return (
		<>
			<Hero />
			<FeaturedOn />
			<Problem />
			<Benefits />
			<Testimonials />
			<Pricing />
			<FAQ />
			<CTA className="mb-48" />
		</>
	)
}
