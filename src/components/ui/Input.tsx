import React, { type ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
	({ className, type, ...props }, ref): React.JSX.Element => (
		<input
			className={cn(
				'flex h-10 w-full px-3 py-2',
				'rounded-md border border-input bg-background outline-none',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
				'text-base placeholder:text-muted-foreground md:text-sm',
				'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
				className
			)}
			ref={ref}
			type={type}
			{...props}
		/>
	)
);
