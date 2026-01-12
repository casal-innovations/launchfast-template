import { Icon } from '#app/ui/components/media/icon'
import { Flex } from '../components/layout/flex'
import { ScrollingLogos } from '../components/media/scrolling-logos'
import { A } from '../components/typography/a'
import { Lead } from '../components/typography/lead'

export const FeaturedOn = () => {
	return (
		<Flex orientation="vertical" gap="10" className="py-48">
			<Lead className="mx-auto text-center">Featured on</Lead>
			<ScrollingLogos>
				<A href="#" target="_blank" className="min-w-20 no-underline">
					<Icon
						name="linkedin"
						className="h-10 w-auto text-muted-500 hover:text-muted-700"
					/>
				</A>
				<A href="#" target="_blank" className="min-w-20 no-underline">
					<Icon
						name="reddit"
						className="h-10 w-auto text-muted-500 hover:text-muted-700"
					/>
				</A>
				<A href="#" target="_blank" className="no-underline">
					<Icon
						name="x"
						className="h-10 w-auto text-muted-500 hover:text-muted-700"
					/>
				</A>
				<A href="#" target="_blank" className="min-w-20 no-underline">
					<Icon
						name="product-hunt"
						className="h-10 w-auto text-muted-500 hover:text-muted-700"
					/>
				</A>
				<A href="#" target="_blank" className="min-w-20 no-underline">
					<Icon
						name="hacker-news"
						className="h-10 w-auto text-muted-500 hover:text-muted-700"
					/>
				</A>
			</ScrollingLogos>
		</Flex>
	)
}
