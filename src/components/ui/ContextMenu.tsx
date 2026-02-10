'use client';

import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';
import type React from 'react';
import { cn } from '@/lib/utils';

type ContextMenuProps = React.ComponentProps<typeof ContextMenuPrimitive.Root>;

export const ContextMenu = ({ ...props }: ContextMenuProps) => (
	<ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
);

type ContextMenuTriggerProps = React.ComponentProps<
	typeof ContextMenuPrimitive.Trigger
>;

export const ContextMenuTrigger = ({ ...props }: ContextMenuTriggerProps) => (
	<ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
);

type ContextMenuContentProps = React.ComponentProps<
	typeof ContextMenuPrimitive.Content
>;

export const ContextMenuContent = ({
	className,
	...props
}: ContextMenuContentProps) => (
	<ContextMenuPrimitive.Portal>
		<ContextMenuPrimitive.Content
			className={cn(
				'max-h-(--radix-context-menu-content-available-height) min-w-50',
				'z-50 origin-(--radix-context-menu-content-transform-origin)',
				'overflow-y-auto overflow-x-hidden backdrop-blur-md supports-backdrop-filter:bg-popover/90',
				'rounded-xl bg-popover p-2 text-popover-foreground ring ring-popover-border',
				'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
				'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
				'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out',
				'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:animate-in',
				className
			)}
			data-slot="context-menu-content"
			{...props}
		/>
	</ContextMenuPrimitive.Portal>
);

type ContextMenuItemProps = React.ComponentProps<
	typeof ContextMenuPrimitive.Item
>;

export const ContextMenuItem = ({
	className,
	...props
}: ContextMenuItemProps) => (
	<ContextMenuPrimitive.Item
		className={cn(
			'relative flex items-center gap-x-3',
			'cursor-pointer select-none rounded-md p-2 font-medium text-sm outline-hidden',
			'focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
			"[&_svg:not([class*='size-'])]:size-5 [&_svg]:pointer-events-none",
			"[&_svg:not([class*='text-'])]:text-foreground [&_svg]:shrink-0",
			className
		)}
		data-slot="context-menu-item"
		{...props}
	/>
);

type ContextMenuSeparatorProps = React.ComponentProps<
	typeof ContextMenuPrimitive.Separator
>;

export const ContextMenuSeparator = ({
	className,
	...props
}: ContextMenuSeparatorProps) => (
	<ContextMenuPrimitive.Separator
		className={cn('-mx-1 my-1 h-px bg-border', className)}
		data-slot="context-menu-separator"
		{...props}
	/>
);
