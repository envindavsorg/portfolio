'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const TooltipProvider = ({ delayDuration = 0, ...props }: ComponentProps<typeof TooltipPrimitive.Provider>) => (
	<TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
);

export const Tooltip = ({ ...props }: ComponentProps<typeof TooltipPrimitive.Root>) => (
	<TooltipProvider>
		<TooltipPrimitive.Root data-slot="tooltip" {...props} />
	</TooltipProvider>
);

export const TooltipTrigger = ({ ...props }: ComponentProps<typeof TooltipPrimitive.Trigger>) => (
	<TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
);

export const TooltipContent = ({
	className,
	sideOffset = 5,
	children,
	...props
}: ComponentProps<typeof TooltipPrimitive.Content>) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			className={cn(
				'flex w-fit max-w-xs items-center gap-x-2',
				'z-50 rounded-md bg-foreground px-3 py-2 text-background',
				'fade-in-0 zoom-in-95 origin-(--transform-origin) animate-in font-medium text-sm',
				'data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2',
				'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
				'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out',
				className
			)}
			data-slot="tooltip-content"
			sideOffset={sideOffset}
			{...props}
		>
			{children}
			<TooltipPrimitive.Arrow
				className={cn(
					'bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=left]:top-1/2! data-[side=right]:top-1/2! data-[side=left]:-right-1 data-[side=top]:-bottom-2.5 data-[side=right]:-left-1 data-[side=left]:-translate-y-1/2 data-[side=right]:-translate-y-1/2',
					'size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-xs',
					'data-[side=top]:rounded-tl-sm data-[side=bottom]:rounded-br-sm'
				)}
			/>
		</TooltipPrimitive.Content>
	</TooltipPrimitive.Portal>
);
