import * as E from '@react-email/components'
import { appName } from '#app/utils/constants.ts'

export function ContactFormEmail({
	name,
	email,
	message,
}: {
	name: string
	email: string
	message: string
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>{`New contact form submission on ${appName}`}</E.Text>
				</h1>
				<p>
					<E.Text>
						<strong>Name:</strong> {name}
					</E.Text>
				</p>
				<p>
					<E.Text>
						<strong>Email:</strong> {email}
					</E.Text>
				</p>
				<p>
					<E.Text>
						<strong>Message:</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>{message}</E.Text>
				</p>
			</E.Container>
		</E.Html>
	)
}
