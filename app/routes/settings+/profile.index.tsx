import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { Button } from '#app/ui/components/buttons/button.js'
import { StatusButton } from '#app/ui/components/buttons/status-button.tsx'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '#app/ui/components/data-display/card.tsx'
import { ErrorList, Field } from '#app/ui/components/forms.tsx'
import { Icon } from '#app/ui/components/media/icon.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'
import { NameSchema } from '#app/utils/user-validation.ts'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

const ProfileFormSchema = z.object({
	name: NameSchema.optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			image: {
				select: { id: true },
			},
		},
	})

	return json({ user })
}

const profileUpdateActionIntent = 'update-profile'

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const intent = formData.get('intent')
	switch (intent) {
		case profileUpdateActionIntent: {
			return profileUpdateAction(userId, formData)
		}
		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export default function EditUserProfile() {
	const data = useLoaderData<typeof loader>()

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-6">
					<div className="relative h-24 w-24 shrink-0">
						<img
							src={getUserImgSrc(data.user.image?.id)}
							alt={
								data.user.name
									? `${data.user.name}'s profile photo`
									: 'Default profile photo'
							}
							className="h-full w-full rounded-full object-cover"
						/>
						<Button
							asChild
							variant="outline"
							className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full p-0"
						>
							<Link
								preventScrollReset
								to="photo"
								title="Change profile photo"
								aria-label="Change profile photo"
							>
								<Icon name="camera" className="h-4 w-4" />
							</Link>
						</Button>
					</div>
					<div className="min-w-0">
						<CardTitle>{data.user.name ?? 'Unnamed user'}</CardTitle>
						<p className="text-sm text-muted-500">{data.user.email}</p>
					</div>
				</div>
			</CardHeader>
			<div className="h-px bg-muted-200" />
			<CardContent className="pt-6">
				<UpdateProfile />
			</CardContent>
		</Card>
	)
}

async function profileUpdateAction(userId: string, formData: FormData) {
	const submission = parseWithZod(formData, { schema: ProfileFormSchema })
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const data = submission.value

	await prisma.user.update({ where: { id: userId }, data: { name: data.name } })

	return json({ result: submission.reply() })
}

function UpdateProfile() {
	const data = useLoaderData<typeof loader>()

	const fetcher = useFetcher<typeof profileUpdateAction>()

	const [form, fields] = useForm({
		id: 'edit-profile',
		constraint: getZodConstraint(ProfileFormSchema),
		lastResult: fetcher.data?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ProfileFormSchema })
		},
		defaultValue: {
			name: data.user.name,
		},
	})

	return (
		<fetcher.Form method="POST" {...getFormProps(form)}>
			<Field
				labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
				inputProps={getInputProps(fields.name, { type: 'text' })}
				errors={fields.name.errors}
			/>

			<ErrorList errors={form.errors} id={form.errorId} />

			<div className="mt-8 flex justify-center">
				<StatusButton
					type="submit"
					size="wide"
					name="intent"
					value={profileUpdateActionIntent}
					status={fetcher.state !== 'idle' ? 'pending' : form.status ?? 'idle'}
				>
					Save changes
				</StatusButton>
			</div>
		</fetcher.Form>
	)
}
