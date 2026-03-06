import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Container } from '#app/ui/components/layout/container.js'
import { appName } from '#app/utils/constants.ts'

export const meta: MetaFunction = () => [{ title: `About | ${appName}` }]

export default function AboutRoute() {
	return (
		<Container className="mx-auto max-w-4xl py-16">
			{/* Mission */}
			<section className="text-center">
				<h1 className="text-h1">About {appName}</h1>
				<p className="mx-auto mt-4 max-w-2xl text-body-lg text-muted-600">
					We believe building great software should be fast, secure, and
					enjoyable. Our mission is to give developers the best possible
					starting point so they can focus on what matters most — shipping
					their product.
				</p>
			</section>

			{/* Values */}
			<section className="mt-20">
				<h2 className="text-center text-h2">Our Values</h2>
				<div className="mt-10 grid gap-8 md:grid-cols-3">
					<div className="rounded-lg border border-muted-200 p-6">
						<h3 className="text-h4">Correctness First</h3>
						<p className="mt-2 text-muted-600">
							We optimize for minimizing irreversible mistakes rather than
							maximizing features. A solid foundation beats a feature-rich
							mess.
						</p>
					</div>
					<div className="rounded-lg border border-muted-200 p-6">
						<h3 className="text-h4">Developer Experience</h3>
						<p className="mt-2 text-muted-600">
							Every decision we make considers the developer experience.
							From tooling to documentation, we want building to feel
							effortless.
						</p>
					</div>
					<div className="rounded-lg border border-muted-200 p-6">
						<h3 className="text-h4">Simplicity</h3>
						<p className="mt-2 text-muted-600">
							We defer complexity and collapse decision surfaces. Less
							optionality, more clarity. Boring, auditable foundations — by
							design.
						</p>
					</div>
				</div>
			</section>

			{/* Team */}
			<section className="mt-20">
				<h2 className="text-center text-h2">The Team</h2>
				<p className="mx-auto mt-4 max-w-2xl text-center text-muted-600">
					{appName} is built by a small, dedicated team passionate about web
					development and developer tools. We use the same stack we ship to you
					— every day.
				</p>
				<div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					<div className="text-center">
						<div className="mx-auto h-24 w-24 rounded-full bg-muted-200" />
						<h3 className="mt-4 text-h5">Team Member</h3>
						<p className="text-sm text-muted-600">Founder & Developer</p>
					</div>
					<div className="text-center">
						<div className="mx-auto h-24 w-24 rounded-full bg-muted-200" />
						<h3 className="mt-4 text-h5">Team Member</h3>
						<p className="text-sm text-muted-600">Developer</p>
					</div>
					<div className="text-center">
						<div className="mx-auto h-24 w-24 rounded-full bg-muted-200" />
						<h3 className="mt-4 text-h5">Team Member</h3>
						<p className="text-sm text-muted-600">Designer</p>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="mt-20 text-center">
				<h2 className="text-h2">Ready to get started?</h2>
				<p className="mx-auto mt-4 max-w-xl text-muted-600">
					Join thousands of developers who ship faster with {appName}.
				</p>
				<div className="mt-8 flex justify-center gap-4">
					<Link
						to="/login"
						className="rounded-md bg-brand-bg px-6 py-3 font-semibold text-foreground shadow-sm hover:bg-brand-bg-hover"
					>
						Get Started
					</Link>
					<Link
						to="/support"
						className="rounded-md border border-muted-300 px-6 py-3 font-semibold text-foreground hover:bg-muted-100"
					>
						Contact Us
					</Link>
				</div>
			</section>
		</Container>
	)
}
