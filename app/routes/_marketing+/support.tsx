import { getFormProps, getInputProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	json,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { StatusButton } from '#app/ui/components/buttons/status-button.tsx'
import { ContactFormEmail } from '#app/ui/components/emails/contact-form-email.tsx'
import { ErrorList, Field, TextareaField } from '#app/ui/components/forms.tsx'
import { Container } from '#app/ui/components/layout/container.js'
import { appName, supportEmail } from '#app/utils/constants.ts'
import { sendEmail } from '#app/utils/email.server.ts'
import { checkHoneypot } from '#app/utils/honeypot.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { redirectWithToast } from '#app/utils/toast.server.ts'

const ContactSchema = z.object({
	name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
	email: z
		.string({ required_error: 'Email is required' })
		.email('Please enter a valid email address'),
	message: z
		.string({ required_error: 'Message is required' })
		.min(10, 'Message must be at least 10 characters'),
})

export const meta: MetaFunction = () => [
	{ title: `Support | ${appName}` },
]

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	checkHoneypot(formData)

	const submission = parseWithZod(formData, { schema: ContactSchema })
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { name, email, message } = submission.value

	const response = await sendEmail({
		to: supportEmail,
		subject: `Contact form: ${name}`,
		react: <ContactFormEmail name={name} email={email} message={message} />,
	})

	if (response.status === 'success') {
		return redirectWithToast('/support', {
			type: 'success',
			title: 'Message sent!',
			description: "We've received your message and will get back to you soon.",
		})
	}

	return json(
		{
			result: submission.reply({
				formErrors: ['Failed to send message. Please try again later.'],
			}),
		},
		{ status: 500 },
	)
}

export default function SupportRoute() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const navigation = useNavigation()
	const prevState = useRef(navigation.state)
	const formRef = useRef<HTMLFormElement>(null)

	useEffect(() => {
		if (prevState.current !== 'idle' && navigation.state === 'idle' && !actionData) {
			formRef.current?.reset()
		}
		prevState.current = navigation.state
	}, [navigation.state, actionData])

	const [form, fields] = useForm({
		id: 'contact-form',
		constraint: getZodConstraint(ContactSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ContactSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<Container className="mx-auto max-w-2xl py-16">
			<div className="text-center">
				<h1 className="text-h1">Contact Support</h1>
				<p className="mt-3 text-body-md text-muted-600">
					Have a question or need help? Fill out the form below and we'll get
					back to you as soon as possible.
				</p>
			</div>
			<div className="mx-auto mt-12 max-w-lg">
				<Form ref={formRef} method="POST" {...getFormProps(form)}>
					<HoneypotInputs />
					<Field
						labelProps={{
							htmlFor: fields.name.id,
							children: 'Name',
						}}
						inputProps={{
							...getInputProps(fields.name, { type: 'text' }),
							autoComplete: 'name',
							placeholder: 'Your name',
						}}
						errors={fields.name.errors}
					/>
					<Field
						labelProps={{
							htmlFor: fields.email.id,
							children: 'Email',
						}}
						inputProps={{
							...getInputProps(fields.email, { type: 'email' }),
							autoComplete: 'email',
							placeholder: 'you@example.com',
						}}
						errors={fields.email.errors}
					/>
					<TextareaField
						labelProps={{
							htmlFor: fields.message.id,
							children: 'Message',
						}}
						textareaProps={{
							...getTextareaProps(fields.message),
							placeholder: 'How can we help you?',
							rows: 6,
						}}
						errors={fields.message.errors}
					/>
					<ErrorList errors={form.errors} id={form.errorId} />
					<StatusButton
						className="w-full"
						status={isPending ? 'pending' : form.status ?? 'idle'}
						type="submit"
						disabled={isPending}
					>
						Send Message
					</StatusButton>
				</Form>
			</div>
		</Container>
	)
}
