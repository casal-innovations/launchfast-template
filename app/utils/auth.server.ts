import { invariant } from '@epic-web/invariant'
import {
	type Prisma,
	type Connection,
	type Password,
	type User,
} from '@prisma/client'
import { redirect } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { Authenticator } from 'remix-auth'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { getPlanById } from '#app/models/plan/get-plan.js'
import { updateUserById } from '#app/models/user/update-user.js'
import { createStripeCustomer } from '#app/services/stripe/api/create-customer.js'
import { createStripeSubscription } from '#app/services/stripe/api/create-subscription.js'
import { PlanId } from '#app/services/stripe/plans.js'
import { stripe } from '#app/services/stripe/stripe.server.ts'
import { connectionSessionStorage, providers } from './connections.server.ts'
import { prisma } from './db.server.ts'
import { getDefaultCurrency } from './locales.ts'
import { combineHeaders, downloadFile } from './misc.tsx'
import { type ProviderUser } from './providers/provider.ts'
import { authSessionStorage } from './session.server.ts'

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
	new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const sessionKey = 'sessionId'

export const authenticator = new Authenticator<ProviderUser>(
	connectionSessionStorage,
)

for (const [providerName, provider] of Object.entries(providers)) {
	authenticator.use(provider.getAuthStrategy(), providerName)
}

export async function getUserId(request: Request) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)
	if (!sessionId) return null
	const session = await prisma.session.findUnique({
		select: { user: { select: { id: true } } },
		where: { id: sessionId, expirationDate: { gt: new Date() } },
	})
	if (!session?.user) {
		throw redirect('/', {
			headers: {
				'set-cookie': await authSessionStorage.destroySession(authSession),
			},
		})
	}
	return session.user.id
}

export async function requireUserId(
	request: Request,
	{ redirectTo }: { redirectTo?: string | null } = {},
) {
	const userId = await getUserId(request)
	if (!userId) {
		const requestUrl = new URL(request.url)
		redirectTo =
			redirectTo === null
				? null
				: redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`
		const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
		const loginRedirect = ['/login', loginParams?.toString()]
			.filter(Boolean)
			.join('?')
		throw redirect(loginRedirect)
	}
	return userId
}

export async function requireAnonymous(request: Request) {
	const userId = await getUserId(request)
	if (userId) {
		throw redirect('/')
	}
}

export async function login({
	email,
	password,
}: {
	email: User['email']
	password: string
}) {
	const user = await verifyUserPassword({ email, password })
	if (!user) return null
	const session = await prisma.session.create({
		select: { id: true, expirationDate: true, userId: true },
		data: {
			expirationDate: getSessionExpirationDate(),
			userId: user.id,
		},
	})
	return session
}

export async function resetUserPassword({
	email,
	password,
}: {
	email: User['email']
	password: string
}) {
	const hashedPassword = await getPasswordHash(password)
	return prisma.user.update({
		where: { email },
		data: {
			password: {
				update: {
					hash: hashedPassword,
				},
			},
		},
	})
}

// Create a strongly typed `SessionSelect` object with `satisfies`
const sessionSelect = {
	id: true,
	expirationDate: true,
	user: { select: { id: true } },
} satisfies Prisma.SessionSelect

// Infer the resulting payload type
type MySessionPayload = Prisma.SessionGetPayload<{
	select: typeof sessionSelect
}>

async function createFreeStripeSubscription({
	email,
	name,
	request,
	session,
}: {
	email: User['email']
	name: User['name']
	request: Request
	session: MySessionPayload
}) {
	invariant(name, 'name is required to onboard a user')
	// Create Stripe customerId for the user
	const customer = await createStripeCustomer({ email, name })
	invariant(customer, 'Unable to create Stripe Customer.')

	// Update user with Stripe customer-id
	const user = await updateUserById(session.user.id, {
		customerId: customer.id,
	})

	// Get client's currency and Free Plan price ID.
	const currency = getDefaultCurrency(request) // USD | EUR
	const freePlan = await getPlanById(PlanId.FREE, { prices: true })
	const freePlanPrice = freePlan?.prices.find(
		price => price.interval === 'year' && price.currency === currency,
	)
	if (!freePlanPrice) throw new Error('Unable to find Free Plan price.')

	// Assign free subsription plan to the user
	createStripeSubscription(user.customerId, freePlanPrice.id)
}

export async function signup({
	email,
	password,
	name,
	request,
}: {
	email: User['email']
	name: User['name']
	password: string
	request: Request
}) {
	const hashedPassword = await getPasswordHash(password)

	const session = await prisma.session.create({
		data: {
			expirationDate: getSessionExpirationDate(),
			user: {
				create: {
					email: email.toLowerCase(),
					name,
					roles: { connect: { name: 'user' } },
					password: {
						create: {
							hash: hashedPassword,
						},
					},
				},
			},
		},
		select: sessionSelect,
	})

	// Create free subscription upon signup
	if (stripe) {
		await createFreeStripeSubscription({
			email,
			name,
			request,
			session,
		})
	}

	return session
}

export async function signupWithConnection({
	email,
	name,
	providerId,
	providerName,
	imageUrl,
	request,
}: {
	email: User['email']
	name: User['name']
	providerId: Connection['providerId']
	providerName: Connection['providerName']
	imageUrl?: string
	request: Request
}) {
	const session = await prisma.session.create({
		data: {
			expirationDate: getSessionExpirationDate(),
			user: {
				create: {
					email: email.toLowerCase(),
					name,
					roles: { connect: { name: 'user' } },
					connections: { create: { providerId, providerName } },
					image: imageUrl
						? { create: await downloadFile(imageUrl) }
						: undefined,
				},
			},
		},
		select: sessionSelect,
	})

	// Create free subscription upon signup
	if (stripe) {
		await createFreeStripeSubscription({
			email,
			name,
			request,
			session,
		})
	}

	return session
}

export async function logout(
	{
		request,
		redirectTo = '/',
	}: {
		request: Request
		redirectTo?: string
	},
	responseInit?: ResponseInit,
) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)
	// if this fails, we still need to delete the session from the user's browser
	// and it doesn't do any harm staying in the db anyway.
	if (sessionId) {
		// the .catch is important because that's what triggers the query.
		// learn more about PrismaPromise: https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismapromise-behavior
		void prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => {})
	}
	throw redirect(safeRedirect(redirectTo), {
		...responseInit,
		headers: combineHeaders(
			{ 'set-cookie': await authSessionStorage.destroySession(authSession) },
			responseInit?.headers,
		),
	})
}

export async function getPasswordHash(password: string) {
	const hash = await bcrypt.hash(password, 10)
	return hash
}

export async function verifyUserPassword({
	id,
	email,
	password,
}: {
	id?: User['id']
	email?: User['email']
	password: Password['hash']
}) {
	// Ensure that either id or email is provided, but not both
	if ((!id && !email) || (id && email)) {
		throw new Error('Either email or id must be provided, but not both')
	}
	const where = email ? { email } : { id }
	const userWithPassword = await prisma.user.findUnique({
		where,
		select: { id: true, password: { select: { hash: true } } },
	})

	if (!userWithPassword || !userWithPassword.password) {
		return null
	}

	const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

	if (!isValid) {
		return null
	}

	return { id: userWithPassword.id }
}
