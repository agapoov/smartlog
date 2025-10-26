import React from 'react'
import { cn } from '.'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string
	children: React.ReactNode
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
				<div className="h-full w-full overflow-auto scrollbar-thin scrollbar-thumb-rounded">{children}</div>

				<div className="pointer-events-none absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-muted/20 to-transparent" />
			</div>
		)
	},
)
