import { type MetaFunction } from '@remix-run/node'
import { Container } from '#app/ui/components/layout/container.js'
import { appName, supportEmail } from '#app/utils/constants.ts'

export const meta: MetaFunction = () => [
	{ title: `Privacy Policy | ${appName}` },
]

export default function PrivacyRoute() {
	return (
		<Container className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl py-16">
			<h1>Privacy Policy</h1>
			<p className="text-sm text-muted-600">
				Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
			</p>

			<p>
				{appName} ("we", "our", or "us") is committed to protecting your
				privacy. This Privacy Policy explains how we collect, use, disclose, and
				safeguard your information when you visit our website and use our
				services.
			</p>

			<h2>Information We Collect</h2>
			<h3>Information You Provide</h3>
			<p>We may collect information that you voluntarily provide, including:</p>
			<ul>
				<li>
					<strong>Account information:</strong> name and email address when
					you create an account.
				</li>
				<li>
					<strong>Payment information:</strong> billing details processed
					securely through our payment provider (Stripe). We do not store your
					full credit card number.
				</li>
				<li>
					<strong>Communications:</strong> any information you provide when
					contacting us through our support form or email.
				</li>
			</ul>

			<h3>Information Collected Automatically</h3>
			<p>
				When you access our service, we may automatically collect certain
				information, including:
			</p>
			<ul>
				<li>IP address and browser type</li>
				<li>Pages visited and time spent on pages</li>
				<li>Referring website addresses</li>
				<li>Device and operating system information</li>
			</ul>

			<h2>How We Use Your Information</h2>
			<p>We use the information we collect to:</p>
			<ul>
				<li>Provide, maintain, and improve our services</li>
				<li>Process transactions and send related information</li>
				<li>Send you technical notices, updates, and support messages</li>
				<li>Respond to your comments, questions, and requests</li>
				<li>
					Monitor and analyze trends, usage, and activities in connection with
					our services
				</li>
				<li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
			</ul>

			<h2>Cookies and Tracking Technologies</h2>
			<p>
				We use cookies and similar tracking technologies to collect and track
				information about your activity on our service. Cookies are small data
				files stored on your device. You can instruct your browser to refuse all
				cookies or to indicate when a cookie is being sent. However, some parts
				of our service may not function properly without cookies.
			</p>

			<h2>Third-Party Services</h2>
			<p>We may use third-party services that collect, monitor, and analyze data:</p>
			<ul>
				<li>
					<strong>Stripe:</strong> for payment processing. Stripe's privacy
					policy can be found at stripe.com/privacy.
				</li>
				<li>
					<strong>Analytics providers:</strong> to help us understand how our
					service is used.
				</li>
				<li>
					<strong>Email service providers:</strong> to send transactional and
					marketing emails.
				</li>
			</ul>

			<h2>Data Retention</h2>
			<p>
				We will retain your personal information only for as long as is necessary
				for the purposes set out in this Privacy Policy. We will retain and use
				your information to the extent necessary to comply with our legal
				obligations, resolve disputes, and enforce our policies.
			</p>

			<h2>Data Security</h2>
			<p>
				We implement appropriate technical and organizational security measures
				to protect your personal information. However, no method of transmission
				over the Internet or method of electronic storage is 100% secure.
			</p>

			<h2>Your Rights</h2>
			<p>
				Depending on your location, you may have the following rights regarding
				your personal data:
			</p>
			<ul>
				<li>Access the personal data we hold about you</li>
				<li>Request correction of inaccurate data</li>
				<li>Request deletion of your data</li>
				<li>Object to or restrict processing of your data</li>
				<li>Request portability of your data</li>
				<li>Withdraw consent at any time</li>
			</ul>

			<h2>Children's Privacy</h2>
			<p>
				Our service is not directed to anyone under the age of 13. We do not
				knowingly collect personal information from children under 13. If we
				become aware that we have collected personal data from a child under 13,
				we will take steps to delete that information.
			</p>

			<h2>Changes to This Policy</h2>
			<p>
				We may update this Privacy Policy from time to time. We will notify you
				of any changes by posting the new Privacy Policy on this page and
				updating the "Last updated" date.
			</p>

			<h2>Contact Us</h2>
			<p>
				If you have any questions about this Privacy Policy, please contact us
				at{' '}
				<a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
			</p>
		</Container>
	)
}
