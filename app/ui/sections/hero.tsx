import { Icon } from '#app/ui/components/media/icon.tsx'
import { Container } from '../components/layout/container'
import { Flex } from '../components/layout/flex'
import { Grid } from '../components/layout/grid'
import { A } from '../components/typography/a'
import { H1 } from '../components/typography/h1'
import { P } from '../components/typography/p'
import { ReviewSummary } from '../patterns/review-summary'

export const Hero = () => {
	return (
		<Container className="relative min-h-[calc(100vh-var(--header-height)-var(--footer-height))] overflow-x-visible">
			<Grid gapX="12" className="grid-cols-1 lg:grid-cols-2">
				<div className="w-full">
					<H1 className="text-fluid-7xl mt-[calc(var(--font-size-fluid-7xl)*0.65)] min-w-max bg-gradient-to-b from-muted-500 to-muted-900 bg-clip-text text-center text-transparent">
						One Command
					</H1>
					<P className="mx-auto max-w-2xl text-center text-fluid-xl text-muted-600">
						To a fully featured, secure, production-ready starter app with an
						SQLite database, shadcn/ui, authentication, Stripe payments, OpenAI
						integration, testing, monitoring, analytics, security, complete
						CI/CD pipeline, and a lot more.
					</P>
					<ReviewSummary className="mt-fluid-16" />
					<Flex justify="center" className="mt-fluid-15">
						<A href="#" className="button primary lg no-underline">
							<Icon name="star-filled" className="text-muted-300" /> Launch Your
							App Now <Icon name="star-filled" className="text-muted-300" />
						</A>
					</Flex>
				</div>
				<div className="h-full w-full rounded-lg bg-muted-200 p-4">
					<Flex justify="center" items="center" className="h-full">
						Add an image or video showcasing your product or service here.
					</Flex>
				</div>
			</Grid>
		</Container>
	)
}
