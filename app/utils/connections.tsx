import { Form } from '@remix-run/react'
import { z } from 'zod'
import { type ButtonProps } from '#app/ui/components/buttons/button.tsx'
import { StatusButton } from '#app/ui/components/buttons/status-button.tsx'
import { Icon } from '#app/ui/components/media/icon.tsx'
import { useIsPending } from './misc.tsx'

export const GITHUB_PROVIDER_NAME = 'github'
// to add another provider, set their name here and add it to the providerNames below

export const providerNames = [GITHUB_PROVIDER_NAME] as const
export const ProviderNameSchema = z.enum(providerNames)
export type ProviderName = z.infer<typeof ProviderNameSchema>

export const providerLabels: Record<ProviderName, string> = {
	[GITHUB_PROVIDER_NAME]: 'GitHub',
} as const

export const providerIcons: Record<ProviderName, React.ReactNode> = {
	[GITHUB_PROVIDER_NAME]: <Icon name="github-logo" />,
} as const

type ProviderConnectionFormProps = {
	redirectTo?: string | null
	type: 'Connect' | 'Continue' | 'Sign in' | 'Sign up'
	providerName: ProviderName
	variant?: ButtonProps['variant']
	suffix?: React.ReactNode
}

export function ProviderConnectionForm({
	redirectTo,
	type,
	providerName,
	variant,
	suffix,
}: ProviderConnectionFormProps) {
	const label = providerLabels[providerName]
	const formAction = `/auth/${providerName}`
	const isPending = useIsPending({ formAction })
	return (
		<Form
			className="flex items-center justify-center gap-2"
			action={formAction}
			method="POST"
		>
			{redirectTo ? (
				<input type="hidden" name="redirectTo" value={redirectTo} />
			) : null}
			<StatusButton
				type="submit"
				className="w-full"
				variant={variant}
				status={isPending ? 'pending' : 'idle'}
			>
				<span className="inline-flex items-center gap-1.5">
					{providerIcons[providerName]}
					<span>
						{type} with {label}
						{suffix}
					</span>
				</span>
			</StatusButton>
		</Form>
	)
}
