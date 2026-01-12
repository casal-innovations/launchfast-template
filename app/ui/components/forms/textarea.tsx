import { type FieldMetadata, getTextareaProps } from '@conform-to/react'
import { type ComponentProps } from 'react'
import { Textarea } from '#app/ui/components/textarea.tsx'

export const TextareaConform = ({
	meta,
	...props
}: {
	meta: FieldMetadata<string>
} & ComponentProps<typeof Textarea>) => {
	return <Textarea {...getTextareaProps(meta)} {...props} />
}
