import { invariant } from '@epic-web/invariant'
import { redirect } from '@remix-run/node'
import { loginWithMagicLink } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { verifySessionStorage } from '#app/utils/verification.server.ts'
import { handleNewSession } from './login.server.ts'
import { onboardingEmailSessionKey } from './onboarding.tsx'
import { type VerifyFunctionArgs } from './verify.server.ts'

export async function handleVerification({
	request,
	submission,
}: VerifyFunctionArgs) {
	invariant(
		submission.status === 'success',
		'Submission should be successful by now',
	)

	const email = submission.value.target
	const redirectTo = submission.value.redirectTo

	const existingUser = await prisma.user.findUnique({
		where: { email: email.toLowerCase() },
		select: { id: true },
	})

	if (existingUser) {
		const session = await loginWithMagicLink({ email })
		invariant(session, 'Failed to create session')
		return handleNewSession({ request, session, redirectTo })
	}

	// New user: redirect to onboarding for name + T&C
	const verifySession = await verifySessionStorage.getSession()
	verifySession.set(onboardingEmailSessionKey, email)
	const onboardingUrl = redirectTo
		? `/onboarding?${new URLSearchParams({ redirectTo })}`
		: '/onboarding'
	return redirect(onboardingUrl, {
		headers: {
			'set-cookie': await verifySessionStorage.commitSession(verifySession),
		},
	})
}
