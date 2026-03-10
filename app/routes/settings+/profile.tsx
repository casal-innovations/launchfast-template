import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { Button } from '#app/ui/components/buttons/button.js'
import { AccountNav } from '#app/ui/components/custom/account-nav.tsx'
import { Icon } from '#app/ui/components/media/icon.tsx'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '#app/ui/components/overlays/sheet.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: {
			name: true,
			email: true,
			image: { select: { id: true } },
		},
	})
	return json({ user })
}

export default function SettingsProfileLayout() {
	const { user } = useLoaderData<typeof loader>()

	return (
		<div className="container mx-auto px-4 py-8 pb-16">
			<div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
				<div className="lg:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm" className="gap-2">
								<Icon name="hamburger-menu" className="h-4 w-4" />
								Menu
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-72">
							<SheetHeader className="mb-6">
								<SheetTitle>Account Settings</SheetTitle>
							</SheetHeader>
							<div className="mb-6 flex items-center gap-3 rounded-lg bg-muted-100 p-3">
								<img
									src={getUserImgSrc(user.image?.id)}
									alt={user.name ?? 'User'}
									className="h-10 w-10 rounded-full object-cover"
								/>
								<p className="min-w-0 flex-1 truncate text-sm font-medium">
									{user.email}
								</p>
							</div>
							<AccountNav />
						</SheetContent>
					</Sheet>
				</div>

				<aside className="hidden w-64 shrink-0 lg:block">
					<div className="mb-6 flex items-center gap-3 rounded-lg border border-muted-200 bg-muted-50 p-4">
						<img
							src={getUserImgSrc(user.image?.id)}
							alt={user.name ?? 'User'}
							className="h-12 w-12 rounded-full object-cover"
						/>
						<p className="min-w-0 flex-1 truncate text-sm font-medium">
							{user.email}
						</p>
					</div>
					<AccountNav />
				</aside>

				<main className="min-w-0 flex-1">
					<Outlet />
				</main>
			</div>
		</div>
	)
}
