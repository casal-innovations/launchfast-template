// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'
import { getDomainUrl } from '#app/utils/misc.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	const origin = getDomainUrl(request)

	try {
		// if we can connect to the database and make a simple query
		// and make a HEAD request to ourselves, then we're good.
		await Promise.all([
			prisma.user.count(),
			fetch(origin, {
				method: 'HEAD',
				headers: { 'X-Healthcheck': 'true' },
			}).then(r => {
				if (!r.ok) return Promise.reject(r)
			}),
		])
		return new Response('OK')
	} catch (error: unknown) {
		console.log('healthcheck ❌', { error })
		return new Response('ERROR', { status: 500 })
	}
}
