import { invariantResponse } from '@epic-web/invariant'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { Button } from '#app/ui/components/buttons/button.js'
import { StatusButton } from '#app/ui/components/buttons/status-button.tsx'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/ui/components/data-display/card.tsx'
import { Icon } from '#app/ui/components/media/icon.tsx'
import { requireUserId, sessionKey } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useDoubleCheck } from '#app/utils/misc.tsx'
import { authSessionStorage } from '#app/utils/session.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

const signOutOfSessionsActionIntent = 'sign-out-of-sessions'
const deleteAccountActionIntent = 'delete-account'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: {
			_count: {
				select: {
					sessions: {
						where: { expirationDate: { gt: new Date() } },
					},
				},
			},
		},
	})
	return json({ sessionCount: user._count.sessions })
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case signOutOfSessionsActionIntent: {
			const authSession = await authSessionStorage.getSession(
				request.headers.get('cookie'),
			)
			const sessionId = authSession.get(sessionKey)
			invariantResponse(
				sessionId,
				'You must be authenticated to sign out of other sessions',
			)
			await prisma.session.deleteMany({
				where: {
					userId,
					id: { not: sessionId },
				},
			})
			return json({ status: 'success' } as const)
		}
		case deleteAccountActionIntent: {
			await prisma.user.delete({ where: { id: userId } })
			return redirectWithToast('/', {
				type: 'success',
				title: 'Data Deleted',
				description: 'All of your data has been deleted',
			})
		}
		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export default function DataPrivacyRoute() {
	const { sessionCount } = useLoaderData<typeof loader>()

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Export your data</CardTitle>
					<CardDescription>Download a copy of all your data</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="mb-4 text-sm text-muted-600">
						Get a JSON file containing all the data associated with your
						account, including your profile information, settings, and any
						content you've created.
					</p>
					<Button asChild variant="outline">
						<Link
							reloadDocument
							download="my-user-data.json"
							to="/resources/download-user-data"
						>
							<Icon name="download" className="mr-2 h-4 w-4" />
							Download data
						</Link>
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Active sessions</CardTitle>
					<CardDescription>
						Manage your active sessions across devices
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignOutOfSessions sessionCount={sessionCount} />
				</CardContent>
			</Card>

			<Card className="border-red-200 dark:border-red-900">
				<CardHeader>
					<CardTitle className="text-red-600 dark:text-red-400">
						Danger zone
					</CardTitle>
					<CardDescription>
						Irreversible actions that affect your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DeleteAccount />
				</CardContent>
			</Card>
		</div>
	)
}

function SignOutOfSessions({ sessionCount }: { sessionCount: number }) {
	const dc = useDoubleCheck()
	const fetcher = useFetcher<typeof action>()
	const otherSessionsCount = sessionCount - 1

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3 rounded-lg bg-muted-100 p-4">
				<Icon name="avatar" className="h-5 w-5 text-muted-600" />
				<div>
					<p className="font-medium">
						{otherSessionsCount > 0
							? `${otherSessionsCount} other active session${otherSessionsCount > 1 ? 's' : ''}`
							: 'This is your only active session'}
					</p>
					<p className="text-sm text-muted-600">
						{otherSessionsCount > 0
							? 'Sign out of all other devices'
							: 'You are not signed in on any other devices'}
					</p>
				</div>
			</div>
			{otherSessionsCount > 0 ? (
				<fetcher.Form method="POST">
					<StatusButton
						{...dc.getButtonProps({
							type: 'submit',
							name: 'intent',
							value: signOutOfSessionsActionIntent,
						})}
						variant={dc.doubleCheck ? 'destructive' : 'outline'}
						status={
							fetcher.state !== 'idle'
								? 'pending'
								: (fetcher.data?.status ?? 'idle')
						}
					>
						<Icon name="avatar" className="mr-2 h-4 w-4" />
						{dc.doubleCheck
							? 'Are you sure?'
							: `Sign out of ${otherSessionsCount} other session${otherSessionsCount > 1 ? 's' : ''}`}
					</StatusButton>
				</fetcher.Form>
			) : null}
		</div>
	)
}

function DeleteAccount() {
	const dc = useDoubleCheck()
	const fetcher = useFetcher<typeof action>()

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950">
				<Icon
					name="trash"
					className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400"
				/>
				<div>
					<p className="font-medium text-red-800 dark:text-red-300">
						Delete your account
					</p>
					<p className="text-sm text-red-700 dark:text-red-400">
						Once you delete your account, there is no going back. All your data
						will be permanently removed.
					</p>
				</div>
			</div>
			<fetcher.Form method="POST">
				<StatusButton
					{...dc.getButtonProps({
						type: 'submit',
						name: 'intent',
						value: deleteAccountActionIntent,
					})}
					variant="destructive"
					status={fetcher.state !== 'idle' ? 'pending' : 'idle'}
				>
					<Icon name="trash" className="mr-2 h-4 w-4" />
					{dc.doubleCheck ? 'Are you sure?' : 'Delete account'}
				</StatusButton>
			</fetcher.Form>
		</div>
	)
}
