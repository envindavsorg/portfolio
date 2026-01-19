'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type TooltipProviderProps = ComponentProps<typeof TooltipPrimitive.Provider> & {
	delay?: number;
};

const TooltipProvider = ({ delay = 0, ...props }: TooltipProviderProps) => (
	<TooltipPrimitive.Provider
		data-slot="tooltip-provider"
		delayDuration={delay}
		{...props}
	/>
);

TooltipProvider.displayName = TooltipPrimitive.Provider.displayName;

type TooltipProps = ComponentProps<typeof TooltipPrimitive.Root>;

const Tooltip = ({ ...props }: TooltipProps) => (
	<TooltipProvider>
		<TooltipPrimitive.Root data-slot="tooltip" {...props} />
	</TooltipProvider>
);

Tooltip.displayName = TooltipPrimitive.Root.displayName;

type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger>;

const TooltipTrigger = ({ ...props }: TooltipTriggerProps) => (
	<TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
);

TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

type TooltipContentProps = ComponentProps<typeof TooltipPrimitive.Content> & {
	offset?: number;
};

const TooltipContent = ({
	offset = 5,
	children,
	...props
}: TooltipContentProps) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			className={cn(
				'z-50 w-fit max-w-xs rounded-sm bg-theme px-2 py-1.5 font-mono font-semibold text-black text-xs',
				'fade-in-0 zoom-in-95 origin-(--transform-origin) animate-in',
				'data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2',
				'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
				'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out',
				props.className
			)}
			data-slot="tooltip-content"
			sideOffset={offset}
			{...props}
		>
			{children}

			<TooltipPrimitive.Arrow
				className={cn(
					'size-2.5 rotate-45 rounded-ee-xs bg-theme fill-theme',
					'translate-y-[calc(-50%-2px)] data-[side=bottom]:top-1 data-[side=top]:-bottom-2.5',
					'data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2',
					'data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2'
				)}
			/>
		</TooltipPrimitive.Content>
	</TooltipPrimitive.Portal>
);

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent };
