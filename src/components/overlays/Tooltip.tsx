'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const TooltipProvider = ({
	delayDuration = 0,
	...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) => (
	<TooltipPrimitive.Provider
		data-slot="tooltip-provider"
		delayDuration={delayDuration}
		{...props}
	/>
);

export const Tooltip = ({
	...props
}: ComponentProps<typeof TooltipPrimitive.Root>) => (
	<TooltipPrimitive.Root data-slot="tooltip" {...props} />
);

export const TooltipTrigger = ({
	...props
}: ComponentProps<typeof TooltipPrimitive.Trigger>) => (
	<TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
);

export const TooltipContent = ({
	className,
	sideOffset = 0,
	children,
	...props
}: ComponentProps<typeof TooltipPrimitive.Content>) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			className={cn(
				'data-open:fade-in-0 data-open:zoom-in-95 data-open:animate-in',
				'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
				'data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=delayed-open]:animate-in',
				'data-[side=bottom]:slide-in-from-top-2',
				'data-[side=left]:slide-in-from-right-2',
				'data-[side=right]:slide-in-from-left-2',
				'data-[side=top]:slide-in-from-bottom-2',
				'z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-md bg-theme px-2 py-1 text-black text-xs',
				className
			)}
			data-slot="tooltip-content"
			sideOffset={sideOffset}
			{...props}
		>
			{children}

			<TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-xs bg-theme fill-theme" />
		</TooltipPrimitive.Content>
	</TooltipPrimitive.Portal>
);
