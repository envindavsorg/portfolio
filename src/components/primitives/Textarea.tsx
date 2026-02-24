import { type ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<
	HTMLTextAreaElement,
	ComponentProps<'textarea'>
>(({ className, ...props }, ref) => (
	<textarea
		className={cn(
			'flex min-h-20 w-full px-3 py-2',
			'rounded-md border border-input bg-background',
			'text-base placeholder:text-muted-foreground md:text-sm',
			'disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		ref={ref}
		{...props}
	/>
));
