import { invariant } from '@epic-web/invariant'
import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import { normalizeEmail } from '#app/utils/providers/provider'
import { readEmail } from '#tests/mocks/utils.ts'
import { createUser, expect, test as base } from '#tests/playwright-utils.ts'

const URL_REGEX = /(?<url>https?:\/\/[^\s$.?#].[^\s]*)/
const CODE_REGEX = /Here's your verification code: (?<code>[\d\w]+)/
function extractUrl(text: string) {
	const match = text.match(URL_REGEX)
	return match?.groups?.url
}

const test = base.extend<{
	getOnboardingData(): {
		name: string
		email: string
	}
}>({
	getOnboardingData: async ({}, use) => {
		const userData = createUser()
		await use(() => {
			return { ...userData }
		})
		await prisma.user.deleteMany({ where: { email: userData.email } })
	},
})

test('onboarding new user with magic link', async ({
	page,
	getOnboardingData,
}) => {
	const onboardingData = getOnboardingData()

	await page.goto('/login')

	const emailTextbox = page.getByRole('textbox', { name: /email/i })
	await emailTextbox.click()
	await emailTextbox.fill(onboardingData.email)

	await page.getByRole('button', { name: /continue/i }).click()
	await expect(page.getByText(/check your email/i)).toBeVisible()

	const email = await readEmail(onboardingData.email)
	invariant(email, 'Email not found')
	expect(email.to).toBe(onboardingData.email.toLowerCase())
	expect(email.from).toBe('hello@launchfast.pro')
	const onboardingUrl = extractUrl(email.text)
	invariant(onboardingUrl, 'Onboarding URL not found')
	await page.goto(onboardingUrl)

	await expect(page).toHaveURL(/\/verify/)

	await page
		.getByRole('main')
		.getByRole('button', { name: /submit/i })
		.click()

	await expect(page).toHaveURL(`/onboarding`)

	await page.getByRole('textbox', { name: /^name/i }).fill(onboardingData.name)

	await page.getByLabel(/terms/i).check()

	await page.getByRole('button', { name: /continue/i }).click()

	await expect(page.getByText(/thanks for signing up/i)).toBeVisible()
})

test('onboarding new user with a short code', async ({
	page,
	getOnboardingData,
}) => {
	const onboardingData = getOnboardingData()

	await page.goto('/login')

	const emailTextbox = page.getByRole('textbox', { name: /email/i })
	await emailTextbox.click()
	await emailTextbox.fill(onboardingData.email)

	await page.getByRole('button', { name: /continue/i }).click()
	await expect(page.getByText(/check your email/i)).toBeVisible()

	const email = await readEmail(onboardingData.email)
	invariant(email, 'Email not found')
	const codeMatch = email.text.match(CODE_REGEX)
	const code = codeMatch?.groups?.code
	invariant(code, 'Onboarding code not found')
	await page.getByRole('textbox', { name: /code/i }).fill(code)
	await page.getByRole('button', { name: /submit/i }).click()

	await expect(page).toHaveURL(`/onboarding`)
})

test('login existing user with magic link', async ({ page, insertNewUser }) => {
	const user = await insertNewUser()
	invariant(user.name, 'User name not found')

	await page.goto('/login')
	await page.getByRole('textbox', { name: /email/i }).fill(user.email)
	await page.getByRole('button', { name: /continue/i }).click()
	await expect(page.getByText(/check your email/i)).toBeVisible()

	const email = await readEmail(user.email)
	invariant(email, 'Email not found')
	const loginUrl = extractUrl(email.text)
	invariant(loginUrl, 'Login URL not found')
	await page.goto(loginUrl)

	await expect(page).toHaveURL(`/`)

	await expect(
		page.getByRole('button', { name: user.name ?? user.email }),
	).toBeVisible()
})

test('completes onboarding after GitHub OAuth given valid user details', async ({
	page,
	prepareGitHubUser,
}) => {
	const ghUser = await prepareGitHubUser()

	expect(
		await prisma.user.findUnique({
			where: { email: normalizeEmail(ghUser.primaryEmail) },
		}),
	).toBeNull()

	await page.goto('/login')
	await page.getByRole('button', { name: /continue with github/i }).click()

	await expect(page).toHaveURL(/\/onboarding\/github/)
	await expect(
		page.getByText(new RegExp(`welcome aboard ${ghUser.primaryEmail}`, 'i')),
	).toBeVisible()

	await expect(page.getByRole('textbox', { name: /^name/i })).toHaveValue(
		ghUser.profile.name,
	)
	const continueButton = page.getByRole('button', {
		name: /continue/i,
	})

	await page
		.getByLabel(/do you agree to our terms of service and privacy policy/i)
		.check()
	await continueButton.click()
	await expect(page.getByText(/thanks for signing up/i)).toBeVisible()

	await prisma.user.findUniqueOrThrow({
		where: { email: normalizeEmail(ghUser.primaryEmail) },
	})
})

test('logs user in after GitHub OAuth if they are already registered', async ({
	page,
	prepareGitHubUser,
}) => {
	const ghUser = await prepareGitHubUser()

	expect(
		await prisma.user.findUnique({
			where: { email: normalizeEmail(ghUser.primaryEmail) },
		}),
	).toBeNull()
	const name = faker.person.fullName()
	const user = await prisma.user.create({
		select: { id: true, name: true },
		data: {
			email: normalizeEmail(ghUser.primaryEmail),
			name,
		},
	})

	const connection = await prisma.connection.findFirst({
		where: { providerName: 'github', userId: user.id },
	})
	expect(connection).toBeNull()

	await page.goto('/login')
	await page.getByRole('button', { name: /continue with github/i }).click()

	await expect(page).toHaveURL(`/`)
	await expect(
		page.getByText(
			new RegExp(
				`your "${ghUser!.profile.login}" github account has been connected`,
				'i',
			),
		),
	).toBeVisible()

	await prisma.connection.findFirstOrThrow({
		where: { providerName: 'github', userId: user.id },
	})
})

test('shows help texts on entering invalid details on onboarding page after GitHub OAuth', async ({
	page,
	prepareGitHubUser,
}) => {
	const ghUser = await prepareGitHubUser()

	await page.goto('/login')
	await page.getByRole('button', { name: /continue with github/i }).click()

	await expect(page).toHaveURL(/\/onboarding\/github/)
	await expect(
		page.getByText(new RegExp(`welcome aboard ${ghUser.primaryEmail}`, 'i')),
	).toBeVisible()

	const continueButton = page.getByRole('button', {
		name: /continue/i,
	})
	await expect(continueButton.getByRole('status')).not.toBeVisible()
	await expect(continueButton.getByText('error')).not.toBeAttached()

	await continueButton.click()
	await expect(
		page.getByText(
			/you must agree to the terms of service and privacy policy/i,
		),
	).toBeVisible()
	await expect(page).toHaveURL(/\/onboarding\/github/)

	await page
		.getByLabel(/do you agree to our terms of service and privacy policy/i)
		.check()
	await continueButton.click()
	await expect(continueButton.getByText('error')).not.toBeAttached()

	await expect(page.getByText(/thanks for signing up/i)).toBeVisible()
})
