'use client';

import { CaretRightIcon, CheckIcon, CircleIcon } from '@phosphor-icons/react';
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';
import type React from 'react';
import { cn } from '@/lib/utils';

const ContextMenu = ({
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.Root
>): React.JSX.Element => (
	<ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
);

const ContextMenuTrigger = ({
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.Trigger
>): React.JSX.Element => (
	<ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
);

const ContextMenuGroup = ({
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.Group
>): React.JSX.Element => (
	<ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
);

const ContextMenuPortal = ({
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.Portal
>): React.JSX.Element => (
	<ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
);

const ContextMenuSub = ({
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.Sub
>): React.JSX.Element => (
	<ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
);

const ContextMenuRadioGroup = ({
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) => (
	<ContextMenuPrimitive.RadioGroup
		data-slot="context-menu-radio-group"
		{...props}
	/>
);

const ContextMenuSubTrigger = ({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
	inset?: boolean;
}): React.JSX.Element => (
	<ContextMenuPrimitive.SubTrigger
		className={cn(
			'flex items-center',
			'cursor-default select-none rounded-md px-3 py-2 text-sm outline-hidden',
			'focus:bg-accent focus:text-accent-foreground',
			'data-[state=open]:bg-accent data-inset:pl-8 data-[state=open]:text-accent-foreground',
			"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className
		)}
		data-inset={inset}
		data-slot="context-menu-sub-trigger"
		{...props}
	>
		{children}
		<CaretRightIcon className="ml-auto" />
	</ContextMenuPrimitive.SubTrigger>
);

const ContextMenuSubContent = ({
	className,
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.SubContent
>): React.JSX.Element => (
	<ContextMenuPrimitive.SubContent
		className={cn(
			'z-50 min-w-64 origin-(--radix-context-menu-content-transform-origin)',
			'overflow-hidden backdrop-blur-md supports-backdrop-filter:bg-popover/90',
			'rounded-md bg-popover p-2 text-popover-foreground ring ring-popover-border',
			'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
			'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
			'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out',
			'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:animate-in',
			className
		)}
		data-slot="context-menu-sub-content"
		{...props}
	/>
);

const ContextMenuContent = ({
	className,
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.Content
>): React.JSX.Element => (
	<ContextMenuPrimitive.Portal>
		<ContextMenuPrimitive.Content
			className={cn(
				'max-h-(--radix-context-menu-content-available-height) min-w-64',
				'z-50 origin-(--radix-context-menu-content-transform-origin)',
				'overflow-y-auto overflow-x-hidden backdrop-blur-md supports-backdrop-filter:bg-popover/90',
				'rounded-md bg-popover p-2 text-popover-foreground ring ring-popover-border',
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

const ContextMenuItem = ({
	className,
	inset,
	variant = 'default',
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
	inset?: boolean;
	variant?: 'default' | 'destructive';
}): React.JSX.Element => (
	<ContextMenuPrimitive.Item
		className={cn(
			'relative flex items-center gap-2',
			'outline-hidden focus:bg-accent focus:text-accent-foreground',
			'data-disabled:pointer-events-none data-disabled:opacity-50',
			'data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20',
			'data-[variant=destructive]:focus:text-destructive',
			'data-[variant=destructive]:text-destructive data-[variant=destructive]:*:[svg]:text-destructive!',
			'cursor-pointer select-none rounded-md p-2 text-sm data-inset:pl-8',
			"[&_svg:not([class*='size-'])]:size-5 [&_svg]:pointer-events-none",
			"[&_svg:not([class*='text-'])]:text-foreground [&_svg]:shrink-0",
			className
		)}
		data-inset={inset}
		data-slot="context-menu-item"
		data-variant={variant}
		{...props}
	/>
);

const ContextMenuCheckboxItem = ({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.CheckboxItem
>): React.JSX.Element => (
	<ContextMenuPrimitive.CheckboxItem
		checked={checked}
		className={cn(
			'relative flex items-center gap-2',
			'cursor-default select-none rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden',
			'focus:bg-accent focus:text-accent-foreground',
			'data-disabled:pointer-events-none data-disabled:opacity-50',
			"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className
		)}
		data-slot="context-menu-checkbox-item"
		{...props}
	>
		<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
			<ContextMenuPrimitive.ItemIndicator>
				<CheckIcon className="size-5" />
			</ContextMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</ContextMenuPrimitive.CheckboxItem>
);

const ContextMenuRadioItem = ({
	className,
	children,
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.RadioItem
>): React.JSX.Element => (
	<ContextMenuPrimitive.RadioItem
		className={cn(
			'relative flex items-center gap-2',
			'cursor-default select-none rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden',
			'focus:bg-accent focus:text-accent-foreground',
			'data-disabled:pointer-events-none data-disabled:opacity-50',
			"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className
		)}
		data-slot="context-menu-radio-item"
		{...props}
	>
		<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
			<ContextMenuPrimitive.ItemIndicator>
				<CircleIcon className="size-2 fill-current" />
			</ContextMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</ContextMenuPrimitive.RadioItem>
);

const ContextMenuLabel = ({
	className,
	inset,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
	inset?: boolean;
}): React.JSX.Element => (
	<ContextMenuPrimitive.Label
		className={cn(
			'px-2 py-1.5 font-medium text-foreground text-sm data-inset:pl-8',
			className
		)}
		data-inset={inset}
		data-slot="context-menu-label"
		{...props}
	/>
);

const ContextMenuSeparator = ({
	className,
	...props
}: React.ComponentProps<
	typeof ContextMenuPrimitive.Separator
>): React.JSX.Element => (
	<ContextMenuPrimitive.Separator
		className={cn('-mx-1 my-1 h-px bg-border', className)}
		data-slot="context-menu-separator"
		{...props}
	/>
);

const ContextMenuShortcut = ({
	className,
	...props
}: React.ComponentProps<'span'>): React.JSX.Element => (
	<span
		className={cn(
			'ml-auto text-muted-foreground text-xs tracking-widest',
			className
		)}
		data-slot="context-menu-shortcut"
		{...props}
	/>
);

export {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuPortal,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
};
