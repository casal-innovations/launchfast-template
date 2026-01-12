import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { format } from 'date-fns'
import { useRef } from 'react'
import { Button } from '#app/ui/components/buttons/button.tsx'
import { Calendar } from '#app/ui/components/forms/calendar.tsx'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/ui/components/overlays/popover.tsx'
import { cn } from '#app/utils/tailwind-merge.ts'
import { Icon } from '../media/icon'

export function DatePickerConform({ meta }: { meta: FieldMetadata<Date> }) {
	const triggerRef = useRef<HTMLButtonElement>(null)
	const control = useControl(meta)

	return (
		<div>
			<input
				className="sr-only"
				aria-hidden
				tabIndex={-1}
				ref={control.register}
				name={meta.name}
				defaultValue={
					meta.initialValue ? new Date(meta.initialValue).toISOString() : ''
				}
				onFocus={() => {
					triggerRef.current?.focus()
				}}
			/>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						variant={'outline'}
						className={cn(
							'w-64 justify-start text-left font-normal focus:ring-2 focus:ring-stone-950 focus:ring-offset-2',
							!control.value && 'text-muted-foreground',
						)}
					>
						<Icon name="calendar" className="mr-2 h-4 w-4" />
						{control.value ? (
							format(control.value, 'PPP')
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
						mode="single"
						selected={new Date(control.value ?? '')}
						onSelect={value => control.change(value?.toISOString() ?? '')}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
