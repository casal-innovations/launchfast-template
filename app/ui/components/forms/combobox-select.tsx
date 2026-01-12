import { useInputControl, getInputProps } from '@conform-to/react'
import { useState, useMemo } from 'react'
import { Button } from '#app/ui/components/buttons/button.tsx'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '#app/ui/components/command.tsx'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/ui/components/overlays/popover.tsx'
import { cn } from '#app/utils/tailwind-merge.ts'
import { Icon } from '../media/icon'

type Option = { value: string; label: string }

interface ComboboxSelectProps {
	field: any // Conform field object (from useForm's fields)
	options: Option[]
	placeholder?: string
	noResultsText?: string
}

export function ComboboxSelect({
	field,
	options,
	placeholder = 'Select an option...',
	noResultsText = 'No options found.',
}: ComboboxSelectProps) {
	const [open, setOpen] = useState(false)
	const [value, setValue] = useState('')
	const [searchValue, setSearchValue] = useState('')
	const control = useInputControl(field)

	// Filter options based on search input
	const filteredOptions = useMemo(() => {
		return options.filter(option =>
			option.label.toLowerCase().includes(searchValue.toLowerCase()),
		)
	}, [options, searchValue])

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					asChild
					onBlur={() => {
						if (!open) control.blur()
					}}
				>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={cn('w-full justify-between', {
							'border-red-500': field.errors?.length,
						})}
					>
						{value
							? options.find(option => option.value === value)?.label
							: placeholder}
						<Icon
							name="chevron-up-down"
							className="ml-2 h-4 w-4 shrink-0 opacity-50"
						/>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput
							placeholder="Search..."
							value={searchValue}
							onValueChange={setSearchValue}
						/>
						<CommandList>
							<CommandEmpty>{noResultsText}</CommandEmpty>
							<CommandGroup className="max-h-[300px] overflow-y-auto">
								{filteredOptions.map(option => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={currentValue => {
											setOpen(false) // Close popover
											setSearchValue('') // Clear search
											setValue(currentValue) // Update display value
											control.change(currentValue) // Sync with Conform
										}}
									>
										<Icon
											name="check"
											className={cn(
												'mr-2 h-4 w-4 opacity-0 [&[data-selected=true]]:opacity-100',
											)}
										/>
										{option.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{/* Hidden input for Conform */}
			<input {...getInputProps(field, { type: 'hidden' })} />
		</>
	)
}
