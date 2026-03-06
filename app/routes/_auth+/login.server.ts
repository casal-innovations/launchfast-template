import { redirect } from '@remix-run/node'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { sessionKey } from '#app/utils/auth.server.ts'
import { authSessionStorage } from '#app/utils/session.server.ts'

export async function handleNewSession(
	{
		request,
		session,
		redirectTo,
	}: {
		request: Request
		session: { userId: string; id: string; expirationDate: Date }
		redirectTo?: string
	},
	responseInit?: ResponseInit,
) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	authSession.set(sessionKey, session.id)

	const headers = new Headers(responseInit?.headers)
	headers.append(
		'set-cookie',
		await authSessionStorage.commitSession(authSession, {
			expires: session.expirationDate,
		}),
	)

	return redirect(safeRedirect(redirectTo), {
		...responseInit,
		headers,
	})
}
