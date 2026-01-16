'use client';

import { Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Popover = Root;

export const PopoverTrigger = Trigger;

export const PopoverContent = forwardRef<ComponentRef<typeof Content>, ComponentPropsWithoutRef<typeof Content>>(
	({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
		<Portal>
			<Content
				align={align}
				className={cn(
					'z-50 w-72 rounded-md border border-input bg-popover p-4 text-popover-foreground outline-none',
					'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out',
					'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:animate-in',
					'data-[side=top]:slide-in-from-bottom-2',
					'data-[side=bottom]:slide-in-from-top-2',
					'data-[side=right]:slide-in-from-left-2',
					'data-[side=left]:slide-in-from-right-2',
					'origin-[--radix-popover-content-transform-origin]',
					className
				)}
				ref={ref}
				sideOffset={sideOffset}
				{...props}
			/>
		</Portal>
	)
);
