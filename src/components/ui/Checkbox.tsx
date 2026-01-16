'use client';

import { CheckIcon } from '@phosphor-icons/react';
import { Indicator, Root } from '@radix-ui/react-checkbox';
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Checkbox = forwardRef<ComponentRef<typeof Root>, ComponentPropsWithoutRef<typeof Root>>(
	({ className, ...props }, ref) => (
		<Root
			className={cn(
				'peer grid size-4 shrink-0 place-content-center rounded-sm',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				'data-[state=checked]:bg-primary',
				'data-[state=checked]:text-primary-foreground',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'border border-primary ring-offset-background',
				className
			)}
			ref={ref}
			{...props}
		>
			<Indicator className={cn('grid place-content-center text-current')}>
				<CheckIcon className="size-4" />
			</Indicator>
		</Root>
	)
);
