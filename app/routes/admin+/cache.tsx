import { invariantResponse } from '@epic-web/invariant'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	json,
	redirect,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	useFetcher,
	useLoaderData,
	useSearchParams,
	useSubmit,
} from '@remix-run/react'
import { Button } from '#app/ui/components/buttons/button.js'
import { GeneralErrorBoundary } from '#app/ui/components/custom/error-boundary.tsx'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/ui/components/data-display/card.tsx'
import { Label } from '#app/ui/components/forms/label.tsx'
import { Input } from '#app/ui/components/input.tsx'
import { Icon } from '#app/ui/components/media/icon.tsx'
import {
	cache,
	getAllCacheKeys,
	lruCache,
	searchCacheKeys,
} from '#app/utils/cache.server.ts'
import {
	ensureInstance,
	getAllInstances,
	getInstanceInfo,
} from '#app/utils/litefs.server.ts'
import { useDebounce, useDoubleCheck } from '#app/utils/misc.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	const searchParams = new URL(request.url).searchParams
	const query = searchParams.get('query')
	if (query === '') {
		searchParams.delete('query')
		return redirect(`/admin/cache?${searchParams.toString()}`)
	}
	const limit = Number(searchParams.get('limit') ?? 100)

	const currentInstanceInfo = await getInstanceInfo()
	const instance =
		searchParams.get('instance') ?? currentInstanceInfo.currentInstance
	const instances = await getAllInstances()
	await ensureInstance(instance)

	let cacheKeys: { sqlite: Array<string>; lru: Array<string> }
	if (typeof query === 'string') {
		cacheKeys = await searchCacheKeys(query, limit)
	} else {
		cacheKeys = await getAllCacheKeys(limit)
	}
	return json({ cacheKeys, instance, instances, currentInstanceInfo })
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	const formData = await request.formData()
	const key = formData.get('cacheKey')
	const { currentInstance } = await getInstanceInfo()
	const instance = formData.get('instance') ?? currentInstance
	const type = formData.get('type')

	invariantResponse(typeof key === 'string', 'cacheKey must be a string')
	invariantResponse(typeof type === 'string', 'type must be a string')
	invariantResponse(typeof instance === 'string', 'instance must be a string')
	await ensureInstance(instance)

	switch (type) {
		case 'sqlite': {
			await cache.delete(key)
			break
		}
		case 'lru': {
			lruCache.delete(key)
			break
		}
		default: {
			throw new Error(`Unknown cache type: ${type}`)
		}
	}
	return json({ success: true })
}

export default function CacheAdminRoute() {
	const data = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const submit = useSubmit()
	const query = searchParams.get('query') ?? ''
	const limit = searchParams.get('limit') ?? '100'
	const instance = searchParams.get('instance') ?? data.instance

	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form)
	}, 400)

	const totalResults =
		data.cacheKeys.sqlite.length + data.cacheKeys.lru.length

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold">Cache Admin</h1>
				<p className="mt-1 text-sm text-muted-600">
					Inspect and delete cached data. Useful for forcing a
					re-fetch when cached data becomes stale.
				</p>
			</div>

			<Card className="mb-6">
				<CardContent className="pt-6">
					<details>
						<summary className="cursor-pointer text-sm font-medium">
							How caching works
						</summary>
						<div className="mt-3 space-y-3 text-sm text-muted-600">
							<p>
								Data enters the cache through{' '}
								<code className="rounded bg-muted-200 px-1.5 py-0.5 font-mono text-xs">
									cachified()
								</code>{' '}
								calls in your server code. You provide a cache key, a
								backend (LRU or SQLite), TTL/SWR settings, and a{' '}
								<code className="rounded bg-muted-200 px-1.5 py-0.5 font-mono text-xs">
									getFreshValue
								</code>{' '}
								function that fetches the data on cache miss.
							</p>
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-md border p-3">
									<p className="font-medium text-foreground">
										LRU Cache (in-memory)
									</p>
									<p className="mt-1 text-xs">
										Fast reads, lost on restart. Use for hot data
										with short TTLs.
									</p>
								</div>
								<div className="rounded-md border p-3">
									<p className="font-medium text-foreground">
										SQLite Cache (persistent)
									</p>
									<p className="mt-1 text-xs">
										Survives restarts. Use for expensive external API
										calls with long TTLs or stale-while-revalidate.
									</p>
								</div>
							</div>
							<p className="text-xs">
								<strong className="text-foreground">When to cache:</strong>{' '}
								external API calls, expensive computations, data that
								doesn&apos;t change on every request.
								See{' '}
								<code className="rounded bg-muted-200 px-1 py-0.5 font-mono text-xs">
									app/utils/providers/github.server.ts
								</code>{' '}
								for a real example using{' '}
								<code className="rounded bg-muted-200 px-1 py-0.5 font-mono text-xs">
									@epic-web/cachified
								</code>
								.
							</p>
						</div>
					</details>
				</CardContent>
			</Card>

			<Card className="mb-6">
				<CardContent className="pt-6">
					<Form
						method="get"
						className="flex flex-col gap-4"
						onChange={e => handleFormChange(e.currentTarget)}
					>
						<div className="flex items-center gap-3">
							<div className="flex-1">
								<Label htmlFor="cache-search">Search</Label>
								<div className="relative mt-1">
									<Icon
										name="magnifying-glass"
										className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-500"
									/>
									<Input
										id="cache-search"
										type="search"
										name="query"
										defaultValue={query}
										placeholder="Filter cache keys..."
										className="pl-9"
									/>
								</div>
							</div>
							<span
								className="mt-6 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted-200 px-2 text-xs font-medium text-muted-700"
								title="Total results"
							>
								{totalResults}
							</span>
						</div>
						<div className="flex items-center gap-4">
							<div className="w-24">
								<Label htmlFor="cache-limit">Limit</Label>
								<Input
									id="cache-limit"
									name="limit"
									defaultValue={limit}
									type="number"
									step="1"
									min="1"
									max="10000"
									className="mt-1"
								/>
							</div>
							<div className="flex-1">
								<Label htmlFor="instance-select">Instance</Label>
								<select
									id="instance-select"
									name="instance"
									defaultValue={instance}
									className="mt-1 flex h-10 w-full appearance-none rounded-md border border-brand-border bg-background bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-sm"
								>
									{Object.entries(data.instances).map(([inst, region]) => (
										<option key={inst} value={inst}>
											{[
												inst,
												`(${region})`,
												inst === data.currentInstanceInfo.currentInstance
													? '(current)'
													: '',
												inst === data.currentInstanceInfo.primaryInstance
													? '(primary)'
													: '',
											]
												.filter(Boolean)
												.join(' ')}
										</option>
									))}
								</select>
							</div>
						</div>
					</Form>
				</CardContent>
			</Card>

			<div className="flex flex-col gap-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg">LRU Cache</CardTitle>
								<CardDescription>
									Volatile — cleared on server restart.
								</CardDescription>
							</div>
							<span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted-200 px-2 text-xs font-medium text-muted-700">
								{data.cacheKeys.lru.length}
							</span>
						</div>
					</CardHeader>
					<CardContent>
						{data.cacheKeys.lru.length > 0 ? (
							<div className="flex flex-col gap-2">
								{data.cacheKeys.lru.map(key => (
									<CacheKeyRow
										key={key}
										cacheKey={key}
										instance={instance}
										type="lru"
									/>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-500">No LRU cache entries.</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg">SQLite Cache</CardTitle>
								<CardDescription>
									Persistent — survives server restarts.
								</CardDescription>
							</div>
							<span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted-200 px-2 text-xs font-medium text-muted-700">
								{data.cacheKeys.sqlite.length}
							</span>
						</div>
					</CardHeader>
					<CardContent>
						{data.cacheKeys.sqlite.length > 0 ? (
							<div className="flex flex-col gap-2">
								{data.cacheKeys.sqlite.map(key => (
									<CacheKeyRow
										key={key}
										cacheKey={key}
										instance={instance}
										type="sqlite"
									/>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-500">
								No SQLite cache entries.
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

function CacheKeyRow({
	cacheKey,
	instance,
	type,
}: {
	cacheKey: string
	instance?: string
	type: 'sqlite' | 'lru'
}) {
	const fetcher = useFetcher<typeof action>()
	const dc = useDoubleCheck()
	const encodedKey = encodeURIComponent(cacheKey)
	const valuePage = `/admin/cache/${type}/${encodedKey}?instance=${instance}`
	return (
		<div className="flex items-center gap-3 rounded-md border bg-white px-3 py-2 dark:bg-muted-50">
			<fetcher.Form method="POST">
				<input type="hidden" name="cacheKey" value={cacheKey} />
				<input type="hidden" name="instance" value={instance} />
				<input type="hidden" name="type" value={type} />
				<Button
					size="sm"
					variant="destructive"
					{...dc.getButtonProps({ type: 'submit' })}
				>
					{fetcher.state === 'idle'
						? dc.doubleCheck
							? 'Sure?'
							: 'Delete'
						: 'Deleting...'}
				</Button>
			</fetcher.Form>
			<Link
				reloadDocument
				to={valuePage}
				className="min-w-0 flex-1 truncate font-mono text-sm hover:underline"
			>
				{cacheKey}
			</Link>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: ({ error }) => (
					<p>You are not allowed to do that: {error?.data.message}</p>
				),
			}}
		/>
	)
}
