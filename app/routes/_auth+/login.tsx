import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { MagicLinkEmail } from '#app/ui/components/emails/magic-link-email.tsx'
import { StatusButton } from '#app/ui/components/buttons/status-button.tsx'
import { GeneralErrorBoundary } from '#app/ui/components/custom/error-boundary.tsx'
import { ErrorList, Field } from '#app/ui/components/forms.tsx'
import { Spacer } from '#app/ui/components/layout/spacer.tsx'
import { requireAnonymous } from '#app/utils/auth.server.ts'
import {
	ProviderConnectionForm,
	providerNames,
} from '#app/utils/connections.tsx'
import { appName } from '#app/utils/constants.ts'
import { sendEmail } from '#app/utils/email.server.ts'
import { checkHoneypot } from '#app/utils/honeypot.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { EmailSchema } from '#app/utils/user-validation.ts'
import {
	isVerificationCooldownActive,
	prepareVerification,
} from './verify.server.ts'

const LoginSchema = z.object({
	email: EmailSchema,
	redirectTo: z.string().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)
	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAnonymous(request)
	const formData = await request.formData()
	checkHoneypot(formData)

	const submission = await parseWithZod(formData, {
		schema: LoginSchema,
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { email, redirectTo } = submission.value

	const cooldownActive = await isVerificationCooldownActive({
		target: email,
		type: 'magic-link',
	})
	if (cooldownActive) {
		return json(
			{
				result: submission.reply({
					formErrors: [
						'A verification email was already sent. Please wait a minute before requesting another.',
					],
				}),
			},
			{ status: 429 },
		)
	}

	const {
		verifyUrl,
		redirectTo: redirectToVerifyPage,
		otp,
	} = await prepareVerification({
		period: 10 * 60,
		request,
		type: 'magic-link',
		target: email,
		redirectTo,
	})

	const response = await sendEmail({
		to: email,
		subject: `Your ${appName} sign-in link`,
		react: <MagicLinkEmail verifyUrl={verifyUrl.toString()} otp={otp} />,
	})

	if (response.status !== 'success') {
		return json(
			{
				result: submission.reply({
					formErrors: [response.error.message],
				}),
			},
			{ status: 500 },
		)
	}

	return redirect(redirectToVerifyPage.toString())
}

const COOLDOWN_SECONDS = 60
const LAST_LOGIN_METHOD_KEY = 'lf_last_login_method'

type LoginMethod = 'github' | 'magic-link'

function LastUsedSuffix({ show }: { show: boolean }): ReactNode {
	if (!show) return null
	return (
		<>
			<span className="text-muted-400"> · </span>
			<span className="text-muted-400 font-normal">Last used</span>
		</>
	)
}

function Divider({ label, className }: { label: string; className?: string }): ReactNode {
	return (
		<div className={`flex items-center gap-4 ${className ?? ''}`}>
			<div className="h-px flex-1 bg-brand-border" />
			<span className="text-body-xs text-muted-600">{label}</span>
			<div className="h-px flex-1 bg-brand-border" />
		</div>
	)
}

export default function LoginPage() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'login-form',
		constraint: getZodConstraint(LoginSchema),
		defaultValue: { redirectTo },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	// 60-second cooldown for magic link button
	const [cooldownRemaining, setCooldownRemaining] = useState(0)
	const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	)

	useEffect(() => {
		return () => {
			if (cooldownIntervalRef.current) {
				clearInterval(cooldownIntervalRef.current)
			}
		}
	}, [])

	const startCooldown = () => {
		setCooldownRemaining(COOLDOWN_SECONDS)
		cooldownIntervalRef.current = setInterval(() => {
			setCooldownRemaining(prev => {
				if (prev <= 1) {
					if (cooldownIntervalRef.current) {
						clearInterval(cooldownIntervalRef.current)
						cooldownIntervalRef.current = null
					}
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}

	const isMagicLinkCoolingDown = cooldownRemaining > 0

	// Last used badge — read from localStorage on mount to avoid SSR mismatch
	const [lastLoginMethod, setLastLoginMethod] = useState<LoginMethod | null>(
		null,
	)

	useEffect(() => {
		try {
			const stored = localStorage.getItem(LAST_LOGIN_METHOD_KEY)
			if (stored === 'github' || stored === 'magic-link') {
				setLastLoginMethod(stored)
			}
		} catch {
			// localStorage unavailable
		}
	}, [])

	const saveLoginMethod = (method: LoginMethod) => {
		try {
			localStorage.setItem(LAST_LOGIN_METHOD_KEY, method)
		} catch {
			// localStorage unavailable
		}
	}

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-md">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome to {appName}</h1>
					<p className="text-body-md text-muted-600">
						Sign in or create an account.
					</p>
				</div>
				<Spacer size="xs" />

				<div>
					<div className="mx-auto w-full max-w-md px-8">
						{/* OAuth */}
						<ul className="flex flex-col gap-5">
							{providerNames.map(providerName => (
								<li key={providerName}>
									<div onClick={() => saveLoginMethod(providerName)}>
										<ProviderConnectionForm
											type="Continue"
											providerName={providerName}
											redirectTo={redirectTo}
											variant="outline"
											suffix={<LastUsedSuffix show={lastLoginMethod === providerName} />}
										/>
									</div>
								</li>
							))}
						</ul>

						<Divider label="or" className="py-5" />

						{/* Email magic link */}
						<Form
							method="POST"
							{...getFormProps(form)}
							onSubmit={() => {
								if (!isMagicLinkCoolingDown) {
									saveLoginMethod('magic-link')
									startCooldown()
								}
							}}
						>
							<HoneypotInputs />

							<Field
								labelProps={{ children: 'Email' }}
								inputProps={{
									...getInputProps(fields.email, { type: 'text' }),
									autoFocus: true,
									className: 'lowercase',
									autoComplete: 'email',
								}}
								errors={fields.email.errors}
							/>

							<input
								{...getInputProps(fields.redirectTo, { type: 'hidden' })}
							/>
							<ErrorList errors={form.errors} id={form.errorId} />

							<StatusButton
								className="w-full"
								status={isPending ? 'pending' : form.status ?? 'idle'}
								type="submit"
								disabled={isPending || isMagicLinkCoolingDown}
							>
								{isMagicLinkCoolingDown
									? `Continue (${cooldownRemaining}s)`
									: 'Continue'}
								<LastUsedSuffix show={lastLoginMethod === 'magic-link'} />
							</StatusButton>
						</Form>
					</div>
				</div>
			</div>
		</div>
	)
}

export const meta: MetaFunction = () => [{ title: `Welcome to ${appName}` }]

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
