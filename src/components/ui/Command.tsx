'use client';

import { Command as CommandPrimitive } from 'cmdk';
import type React from 'react';
import { useRef } from 'react';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { cn } from '@/lib/utils';

export const Command = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>): React.JSX.Element => (
	<CommandPrimitive
		className={cn('flex h-full w-full flex-col overflow-hidden text-foreground', className)}
		data-slot="command"
		{...props}
	/>
);

export const CommandInput = ({ ...props }: React.ComponentProps<typeof CommandPrimitive.Input>): React.JSX.Element => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<div
			className="flex h-12 items-center gap-x-3 border-b px-4 max-sm:border-t"
			data-slot="command-input-wrapper"
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
		>
			<SearchIcon ref={iconRef} size={16} />
			<CommandPrimitive.Input
				className={cn(
					'flex h-10 w-full rounded-md bg-transparent py-3 text-sm',
					'outline-hidden placeholder:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
				)}
				data-slot="command-input"
				{...props}
			/>
		</div>
	);
};

export const CommandList = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>): React.JSX.Element => (
	<CommandPrimitive.List
		className={cn('max-h-80 scroll-py-0 overflow-y-auto overflow-x-hidden', className)}
		data-slot="command-list"
		{...props}
	/>
);

export const CommandEmpty = ({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>): React.JSX.Element => (
	<CommandPrimitive.Empty className="py-8 text-center text-sm" data-slot="command-empty" {...props} />
);

export const CommandGroup = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>): React.JSX.Element => (
	<CommandPrimitive.Group
		className={cn(
			'overflow-hidden p-1 text-foreground',
			'[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2',
			'[&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
			'[&_[cmdk-group-heading]]:text-xs',
			className
		)}
		data-slot="command-group"
		{...props}
	/>
);

export const CommandSeparator = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>): React.JSX.Element => (
	<CommandPrimitive.Separator className={cn('h-px bg-input', className)} data-slot="command-separator" {...props} />
);

export const CommandItem = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>): React.JSX.Element => (
	<CommandPrimitive.Item
		className={cn(
			'flex items-center gap-2',
			'relative cursor-pointer select-none outline-hidden',
			'rounded-md px-2 py-1.5 text-sm',
			'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
			'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
			"[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-theme",
			'[&_svg]:pointer-events-none [&_svg]:shrink-0',
			className
		)}
		data-slot="command-item"
		{...props}
	/>
);
