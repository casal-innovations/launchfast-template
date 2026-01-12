import { useFetcher } from '@remix-run/react'

export function CustomerPortalButton() {
	const fetcher = useFetcher()
	const isLoading = fetcher.state !== 'idle'

	return (
		<fetcher.Form
			method="post"
			action="/stripe/create-customer-portal"
		>
			<button className="flex h-10 w-48 flex-row items-center justify-center rounded-xl border border-muted-600 px-4 font-bold text-muted-600 transition hover:scale-105 hover:border-muted-200 active:opacity-80">
				<span>{isLoading ? 'Redirecting ...' : 'Customer Portal'}</span>
			</button>
		</fetcher.Form>
	)
}
