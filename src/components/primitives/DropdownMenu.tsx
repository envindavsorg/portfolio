'use client';

import { CaretRightIcon, CheckIcon, CircleIcon } from '@phosphor-icons/react';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import type React from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = ({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) => (
	<DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
);

export const DropdownMenuPortal = ({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) => (
	<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
);

export const DropdownMenuTrigger = ({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) => (
	<DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
);

export const DropdownMenuContent = ({
	className,
	sideOffset = 4,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			className={cn(
				'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-32 overflow-hidden rounded-md bg-popover p-1 text-popover-foreground ring ring-input backdrop-blur-md data-[state=closed]:animate-out data-[state=open]:animate-in supports-backdrop-filter:bg-popover/90',
				className
			)}
			data-slot="dropdown-menu-content"
			sideOffset={sideOffset}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
);

export const DropdownMenuGroup = ({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) => (
	<DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
);

export const DropdownMenuItem = ({
	className,
	inset,
	variant = 'default',
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	inset?: boolean;
	variant?: 'default' | 'destructive';
}) => (
	<DropdownMenuPrimitive.Item
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-xl px-3 py-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[variant=destructive]:*:[svg]:text-destructive!",
			className
		)}
		data-inset={inset}
		data-slot="dropdown-menu-item"
		data-variant={variant}
		{...props}
	/>
);

export const DropdownMenuCheckboxItem = ({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => (
	<DropdownMenuPrimitive.CheckboxItem
		checked={checked}
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className
		)}
		data-slot="dropdown-menu-checkbox-item"
		{...props}
	>
		<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<CheckIcon className="size-4" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.CheckboxItem>
);

export const DropdownMenuRadioGroup = ({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) => (
	<DropdownMenuPrimitive.RadioGroup
		data-slot="dropdown-menu-radio-group"
		{...props}
	/>
);

export const DropdownMenuRadioItem = ({
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) => (
	<DropdownMenuPrimitive.RadioItem
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className
		)}
		data-slot="dropdown-menu-radio-item"
		{...props}
	>
		<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<CircleIcon className="size-2 fill-current" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.RadioItem>
);

export const DropdownMenuLabel = ({
	className,
	inset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
	inset?: boolean;
}) => (
	<DropdownMenuPrimitive.Label
		className={cn('px-2 py-1.5 font-medium text-sm data-inset:pl-8', className)}
		data-inset={inset}
		data-slot="dropdown-menu-label"
		{...props}
	/>
);

export const DropdownMenuSeparator = ({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
	<DropdownMenuPrimitive.Separator
		className={cn('-mx-1 my-1 h-px bg-border', className)}
		data-slot="dropdown-menu-separator"
		{...props}
	/>
);

export const DropdownMenuShortcut = ({
	className,
	...props
}: React.ComponentProps<'span'>) => (
	<span
		className={cn(
			'ml-auto text-muted-foreground text-xs tracking-widest',
			className
		)}
		data-slot="dropdown-menu-shortcut"
		{...props}
	/>
);

export const DropdownMenuSub = ({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) => (
	<DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
);

export const DropdownMenuSubTrigger = ({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
	inset?: boolean;
}) => (
	<DropdownMenuPrimitive.SubTrigger
		className={cn(
			'flex cursor-default select-none items-center rounded-xl px-3 py-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-inset:pl-8 data-[state=open]:text-accent-foreground',
			className
		)}
		data-inset={inset}
		data-slot="dropdown-menu-sub-trigger"
		{...props}
	>
		{children}
		<CaretRightIcon className="ml-auto size-4" />
	</DropdownMenuPrimitive.SubTrigger>
);

export const DropdownMenuSubContent = ({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) => (
	<DropdownMenuPrimitive.SubContent
		className={cn(
			'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-32 overflow-hidden rounded-2xl bg-popover p-1 text-popover-foreground shadow-popover ring ring-popover-border backdrop-blur-md data-[state=closed]:animate-out data-[state=open]:animate-in supports-backdrop-filter:bg-popover/90',
			className
		)}
		data-slot="dropdown-menu-sub-content"
		{...props}
	/>
);
