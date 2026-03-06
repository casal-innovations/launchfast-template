import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { StatusButton } from '#app/ui/components/buttons/status-button.tsx'
import { GeneralErrorBoundary } from '#app/ui/components/custom/error-boundary.tsx'
import { ErrorList, OTPField } from '#app/ui/components/forms.tsx'
import { Spacer } from '#app/ui/components/layout/spacer.tsx'
import { checkHoneypot } from '#app/utils/honeypot.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { validateRequest } from './verify.server.ts'

export const codeQueryParam = 'code'
export const targetQueryParam = 'target'
export const typeQueryParam = 'type'
export const redirectToQueryParam = 'redirectTo'
const types = ['onboarding', 'change-email', 'magic-link'] as const
const VerificationTypeSchema = z.enum(types)
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>

export const VerifySchema = z.object({
	[codeQueryParam]: z.string().min(6).max(6),
	[typeQueryParam]: VerificationTypeSchema,
	[targetQueryParam]: z.string(),
	[redirectToQueryParam]: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	checkHoneypot(formData)
	return validateRequest(request, formData)
}

export default function VerifyRoute() {
	const [searchParams] = useSearchParams()
	const isPending = useIsPending()
	const actionData = useActionData<typeof action>()
	const formRef = useRef<HTMLFormElement>(null)
	const hasSubmitted = useRef(false)

	const parsedType = VerificationTypeSchema.safeParse(
		searchParams.get(typeQueryParam),
	)
	const type = parsedType.success ? parsedType.data : null

	const code = searchParams.get(codeQueryParam)
	const target = searchParams.get(targetQueryParam)
	const redirectTo = searchParams.get(redirectToQueryParam)
	const hasAllParams = Boolean(code && type && target)

	// Auto-submit when all params are present (e.g. user clicked the email link)
	useEffect(() => {
		if (hasAllParams && !hasSubmitted.current) {
			hasSubmitted.current = true
			formRef.current?.submit()
		}
	}, [hasAllParams])

	const checkEmail = (
		<>
			<h1 className="text-h1">Check your email</h1>
			<p className="mt-3 text-body-md text-muted-600">
				We've sent you a code to verify your email address.
			</p>
		</>
	)

	const headings: Record<VerificationTypes, React.ReactNode> = {
		onboarding: checkEmail,
		'change-email': checkEmail,
		'magic-link': checkEmail,
	}

	const [form, fields] = useForm({
		id: `verify-form-${type}-${target}`,
		constraint: getZodConstraint(VerifySchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerifySchema })
		},
		defaultValue: {
			code,
			type,
			target,
			redirectTo,
		},
	})

	// When all URL params are present, show a loading state with auto-submit
	if (hasAllParams) {
		return (
			<main className="container flex flex-col items-center justify-center pb-32 pt-20">
				<noscript>
					<style>{`.js-only { display: none !important; }`}</style>
				</noscript>

				{/* Loading state — hidden for noscript users */}
				<div className="js-only flex flex-col items-center gap-4 text-center">
					<h1 className="text-h1">Verifying...</h1>
					<p className="text-body-md text-muted-600">Signing you in...</p>
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-300 border-t-foreground" />
				</div>

				{/* Hidden auto-submit form — JS submits this on mount */}
				<Form ref={formRef} method="POST" className="hidden">
					<HoneypotInputs />
					<input type="hidden" name={codeQueryParam} value={code ?? ''} />
					<input type="hidden" name={typeQueryParam} value={type ?? ''} />
					<input
						type="hidden"
						name={targetQueryParam}
						value={target ?? ''}
					/>
					{redirectTo ? (
						<input
							type="hidden"
							name={redirectToQueryParam}
							value={redirectTo}
						/>
					) : null}
				</Form>

				{/* Noscript fallback: show submit button */}
				<noscript>
					<div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
						<div className="text-center">
							<h1 className="text-h1">Verify your email</h1>
							<p className="mt-3 text-body-md text-muted-600">
								Click the button below to complete verification.
							</p>
						</div>
						<form method="POST" className="mt-6 flex flex-col gap-4">
							<input
								type="hidden"
								name={codeQueryParam}
								value={code ?? ''}
							/>
							<input
								type="hidden"
								name={typeQueryParam}
								value={type ?? ''}
							/>
							<input
								type="hidden"
								name={targetQueryParam}
								value={target ?? ''}
							/>
							{redirectTo ? (
								<input
									type="hidden"
									name={redirectToQueryParam}
									value={redirectTo}
								/>
							) : null}
							<button
								type="submit"
								className="rounded-lg bg-foreground px-4 py-2 text-background"
							>
								Verify
							</button>
						</form>
					</div>
				</noscript>

				{/* Show errors from auto-submit if any */}
				{actionData?.result?.error ? (
					<div className="mt-4">
						<ErrorList errors={form.errors} id={form.errorId} />
					</div>
				) : null}
			</main>
		)
	}

	return (
		<main className="container flex flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				{type ? headings[type] : 'Invalid Verification Type'}
			</div>

			<Spacer size="xs" />

			<div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
				<div>
					<ErrorList errors={form.errors} id={form.errorId} />
				</div>
				<div className="flex w-full gap-2">
					<Form method="POST" {...getFormProps(form)} className="flex-1">
						<HoneypotInputs />
						<div className="flex items-center justify-center">
							<OTPField
								labelProps={{
									htmlFor: fields[codeQueryParam].id,
									children: 'Code',
								}}
								inputProps={{
									...getInputProps(fields[codeQueryParam], { type: 'text' }),
									autoComplete: 'one-time-code',
									autoFocus: true,
								}}
								errors={fields[codeQueryParam].errors}
							/>
						</div>
						<input
							{...getInputProps(fields[typeQueryParam], { type: 'hidden' })}
						/>
						<input
							{...getInputProps(fields[targetQueryParam], { type: 'hidden' })}
						/>
						<input
							{...getInputProps(fields[redirectToQueryParam], {
								type: 'hidden',
							})}
						/>
						<StatusButton
							className="w-full"
							status={isPending ? 'pending' : form.status ?? 'idle'}
							type="submit"
							disabled={isPending}
						>
							Submit
						</StatusButton>
					</Form>
				</div>
			</div>
		</main>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
