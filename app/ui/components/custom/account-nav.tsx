import { NavLink } from '@remix-run/react'
import { Icon, type IconName } from '#app/ui/components/media/icon.tsx'
import { cn } from '#app/utils/tailwind-merge.ts'

type NavItem = {
	to: string
	icon: IconName
	label: string
	end?: boolean
}

type NavSection = {
	title: string
	items: NavItem[]
}

const navSections: NavSection[] = [
	{
		title: 'Profile',
		items: [
			{
				to: '/settings/profile',
				icon: 'avatar',
				label: 'Profile',
				end: true,
			},
		],
	},
	{
		title: 'Security',
		items: [
			{
				to: 'change-email',
				icon: 'envelope-closed',
				label: 'Email',
			},
			{
				to: 'connections',
				icon: 'link-2',
				label: 'Connections',
			},
		],
	},
	{
		title: 'Data & Privacy',
		items: [
			{
				to: 'data-privacy',
				icon: 'download',
				label: 'Data & Privacy',
			},
		],
	},
]

export function AccountNav({ className }: { className?: string }) {
	return (
		<nav className={cn('flex flex-col gap-6', className)}>
			{navSections.map((section) => (
				<div key={section.title}>
					<h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-500">
						{section.title}
					</h3>
					<ul className="flex flex-col gap-1">
						{section.items.map((item) => (
							<li key={item.to}>
								<NavLink
									to={item.to}
									end={item.end}
									className={({ isActive }) =>
										cn(
											'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
											isActive
												? 'bg-muted-200 text-foreground'
												: 'text-muted-600 hover:bg-muted-100 hover:text-foreground',
										)
									}
								>
									<Icon name={item.icon} className="h-4 w-4" />
									{item.label}
								</NavLink>
							</li>
						))}
					</ul>
				</div>
			))}
		</nav>
	)
}
