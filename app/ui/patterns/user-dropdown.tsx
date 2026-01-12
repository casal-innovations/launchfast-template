import { Form, Link, useRouteLoaderData, useSubmit } from '@remix-run/react'
import { useRef } from 'react'
import { type loader as rootLoader } from '#app/root.tsx'
import { Button } from '#app/ui/components/buttons/button.tsx'
import { Icon } from '#app/ui/components/media/icon.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from '#app/ui/components/overlays/dropdown-menu.tsx'
import { getUserImgSrc } from '#app/utils/misc.js'
import { useUser } from '#app/utils/user.js'

export const UserDropdown = () => {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)
	const { isStripeEnabled } = useRouteLoaderData<typeof rootLoader>('root')!

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" className="flex items-center gap-2">
					<img
						className="h-8 w-8 rounded-full object-cover"
						alt={
							user.name
								? `${user.name}'s profile photo`
								: 'User’s profile photo'
						}
						src={getUserImgSrc(user.image?.id)}
					/>
					<span className="text-body-sm font-bold">{user.name}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start">
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/settings/profile`}>
							<Icon className="text-body-md" name="avatar">
								Profile
							</Icon>
						</Link>
					</DropdownMenuItem>
					{isStripeEnabled ? (
						<DropdownMenuItem asChild>
							<Link prefetch="intent" to={`/account`}>
								<Icon className="text-body-md" name="gear">
									Account
								</Icon>
							</Link>
						</DropdownMenuItem>
					) : null}
					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={event => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/logout" method="POST" ref={formRef}>
							<Icon className="text-body-md" name="exit">
								<button type="submit">Logout</button>
							</Icon>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}
