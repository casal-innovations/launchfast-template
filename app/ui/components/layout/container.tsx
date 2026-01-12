import { type HTMLAttributes, type PropsWithChildren, forwardRef } from 'react'
import { cn } from '#app/utils/tailwind-merge.ts'

const Container = forwardRef<HTMLDivElement, PropsWithChildren<HTMLAttributes<HTMLDivElement>>>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('container', className)} {...props} />
))
Container.displayName = 'Container'

export { Container }
