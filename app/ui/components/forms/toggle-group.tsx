import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from '@conform-to/react'
import { type ComponentProps, type ElementRef, useRef } from 'react'
import {
	ToggleGroup,
	ToggleGroupItem,
} from '#app/ui/components/toggle-group.tsx'

export const ToggleGroupConform = ({
	type = 'single',
	meta,
	items,
	...props
}: {
	items: Array<{ value: string; label: string }>
	meta: FieldMetadata<string | string[]>
} & Omit<ComponentProps<typeof ToggleGroup>, 'defaultValue'>) => {
	const toggleGroupRef = useRef<ElementRef<typeof ToggleGroup>>(null)
	// Ensure initialValue is a valid type
	const sanitizedInitialValue =
		Array.isArray(meta.initialValue) && meta.initialValue
			? meta.initialValue.filter(
					(value): value is string => value !== undefined,
				)
			: meta.initialValue
	const control = useControl<string | string[]>({
		...meta,
		initialValue: sanitizedInitialValue,
	})

	return (
		<>
			{type === 'single' ? (
				<input
					name={meta.name}
					ref={control.register}
					className="sr-only"
					tabIndex={-1}
					defaultValue={meta.initialValue as string}
					onFocus={() => {
						toggleGroupRef.current?.focus()
					}}
				/>
			) : (
				<select
					multiple
					name={meta.name}
					className="sr-only"
					ref={control.register}
					onFocus={() => {
						toggleGroupRef.current?.focus()
					}}
					defaultValue={meta.initialValue as readonly string[]}
					tabIndex={-1}
				>
					{items.map(item => (
						<option value={item.value} key={item.value}>
							{item.label}
						</option>
					))}
				</select>
			)}

			{type === 'multiple' ? (
				<ToggleGroup
					{...props}
					type="multiple"
					ref={toggleGroupRef}
					value={control.value as string[] | undefined}
					onValueChange={(value: string[]) => {
						props.onValueChange?.(value as string & string[])
						control.change(value)
					}}
				>
					{items.map(item => (
						<ToggleGroupItem key={item.value} value={item.value}>
							{item.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			) : (
				<ToggleGroup
					{...props}
					type="single"
					ref={toggleGroupRef}
					value={control.value as string | undefined}
					onValueChange={(value: string) => {
						props.onValueChange?.(value as string & string[])
						control.change(value)
					}}
				>
					{items.map(item => (
						<ToggleGroupItem key={item.value} value={item.value}>
							{item.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			)}
		</>
	)
}
