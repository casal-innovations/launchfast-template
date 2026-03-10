import { type MetaFunction } from '@remix-run/node'
import { Pricing } from '#app/ui/sections/pricing.js'
import { appName } from '#app/utils/constants.ts'

export const meta: MetaFunction = () => [
	{ title: `Pricing | ${appName}` },
]

export default function PricingRoute() {
	return <Pricing />
}
