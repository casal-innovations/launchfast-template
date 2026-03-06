import { type MetaFunction } from '@remix-run/node'
import { Container } from '#app/ui/components/layout/container.js'
import { appName, supportEmail } from '#app/utils/constants.ts'

export const meta: MetaFunction = () => [
	{ title: `Terms of Service | ${appName}` },
]

export default function TermsOfServiceRoute() {
	return (
		<Container className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl py-16">
			<h1>Terms of Service</h1>
			<p className="text-sm text-muted-600">
				Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
			</p>

			<p>
				Please read these Terms of Service ("Terms") carefully before using{' '}
				{appName} ("Service", "we", "our", or "us"). By accessing or using our
				Service, you agree to be bound by these Terms.
			</p>

			<h2>Acceptance of Terms</h2>
			<p>
				By creating an account or using our Service, you agree to these Terms and
				our Privacy Policy. If you do not agree to these Terms, you may not use
				the Service.
			</p>

			<h2>Account Terms</h2>
			<ul>
				<li>You must be at least 13 years old to use this Service.</li>
				<li>
					You are responsible for maintaining the security of your account.
				</li>
				<li>
					You are responsible for all activity that occurs under your account.
				</li>
				<li>
					You must provide accurate and complete information when creating your
					account.
				</li>
				<li>
					You must not use the Service for any illegal or unauthorized purpose.
				</li>
			</ul>

			<h2>Acceptable Use</h2>
			<p>You agree not to:</p>
			<ul>
				<li>
					Use the Service in any way that violates applicable laws or
					regulations
				</li>
				<li>
					Attempt to gain unauthorized access to the Service or its related
					systems
				</li>
				<li>
					Transmit any viruses, malware, or other malicious code
				</li>
				<li>
					Interfere with or disrupt the integrity or performance of the Service
				</li>
				<li>
					Use the Service to send unsolicited communications (spam)
				</li>
				<li>
					Impersonate any person or entity, or misrepresent your affiliation
					with a person or entity
				</li>
			</ul>

			<h2>Intellectual Property</h2>
			<p>
				The Service and its original content, features, and functionality are and
				will remain the exclusive property of {appName} and its licensors. The
				Service is protected by copyright, trademark, and other laws. Our
				trademarks may not be used in connection with any product or service
				without our prior written consent.
			</p>

			<h2>User Content</h2>
			<p>
				You retain ownership of any content you submit, post, or display on or
				through the Service. By submitting content, you grant us a worldwide,
				non-exclusive, royalty-free license to use, reproduce, and display such
				content in connection with operating and providing the Service.
			</p>

			<h2>Payment Terms</h2>
			<ul>
				<li>
					Certain features of the Service may require payment. You agree to pay
					all fees associated with your use of the Service.
				</li>
				<li>
					All payments are processed securely through our payment provider
					(Stripe).
				</li>
				<li>
					Fees are non-refundable except as required by law or as explicitly
					stated in our refund policy.
				</li>
			</ul>

			<h2>Termination</h2>
			<p>
				We may terminate or suspend your account and access to the Service
				immediately, without prior notice or liability, for any reason,
				including if you breach these Terms. Upon termination, your right to use
				the Service will immediately cease.
			</p>

			<h2>Limitation of Liability</h2>
			<p>
				To the maximum extent permitted by law, {appName} shall not be liable for
				any indirect, incidental, special, consequential, or punitive damages,
				or any loss of profits or revenues, whether incurred directly or
				indirectly, or any loss of data, use, goodwill, or other intangible
				losses, resulting from:
			</p>
			<ul>
				<li>Your use or inability to use the Service</li>
				<li>
					Any unauthorized access to or use of our servers and/or any personal
					information stored therein
				</li>
				<li>Any interruption or cessation of transmission to or from the Service</li>
				<li>
					Any bugs, viruses, or similar harmful code transmitted through the
					Service by any third party
				</li>
			</ul>

			<h2>Disclaimer</h2>
			<p>
				The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We
				disclaim all warranties of any kind, whether express or implied,
				including but not limited to implied warranties of merchantability,
				fitness for a particular purpose, and non-infringement.
			</p>

			<h2>Governing Law</h2>
			<p>
				These Terms shall be governed by and construed in accordance with the
				laws of the jurisdiction in which {appName} operates, without regard to
				its conflict of law provisions.
			</p>

			<h2>Changes to Terms</h2>
			<p>
				We reserve the right to modify or replace these Terms at any time. We
				will provide notice of any material changes by posting the updated Terms
				on this page and updating the "Last updated" date. Your continued use of
				the Service after such changes constitutes acceptance of the new Terms.
			</p>

			<h2>Contact Us</h2>
			<p>
				If you have any questions about these Terms, please contact us at{' '}
				<a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
			</p>
		</Container>
	)
}
