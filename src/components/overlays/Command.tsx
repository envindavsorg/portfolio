'use client';

import { Command as CommandPrimitive, useCommandState } from 'cmdk';
import { type ComponentProps, useEffect, useRef } from 'react';
import { FrownIcon } from '@/components/icons/FrownIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { cn } from '@/lib/utils';

const Command = ({
	className,
	...props
}: ComponentProps<typeof CommandPrimitive>) => (
	<CommandPrimitive
		className={cn('flex size-full flex-col overflow-hidden', className)}
		data-slot="command"
		{...props}
	/>
);

const CommandInput = ({
	className,
	...props
}: ComponentProps<typeof CommandPrimitive.Input>) => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<div
			className={cn('flex h-10 items-center gap-x-3 px-4 sm:h-12', className)}
			data-slot="command-input-wrapper"
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
		>
			<SearchIcon ref={iconRef} size={16} />
			<CommandPrimitive.Input
				className="flex-1 outline-hidden placeholder:text-foreground placeholder:text-sm"
				data-slot="command-input"
				placeholder="Tapez une commande ..."
				{...props}
			/>
		</div>
	);
};

const CommandList = ({
	className,
	...props
}: ComponentProps<typeof CommandPrimitive.List>) => (
	<CommandPrimitive.List
		className={cn(
			'max-h-115 scroll-py-0 overflow-y-auto overflow-x-hidden',
			className
		)}
		data-slot="command-list"
		{...props}
	/>
);

const CommandEmpty = ({
	className,
	...props
}: ComponentProps<typeof CommandPrimitive.Empty>) => {
	const iconRef = useRef<AnimatedIconHandle>(null);
	const search = useCommandState((state) => state.search);
	const filtered = useCommandState((state) => state.filtered.count);

	useEffect(() => {
		if (search && filtered === 0) {
			iconRef.current?.startAnimation();
		} else {
			iconRef.current?.stopAnimation();
		}
	}, [search, filtered]);

	return (
		<CommandPrimitive.Empty
			className={cn(
				'flex flex-col items-center justify-center gap-y-3 px-6 py-8',
				className
			)}
			data-slot="command-empty"
			{...props}
		>
			<FrownIcon className="text-theme" ref={iconRef} />
			<div className="space-y-1 text-center">
				<h3 className="font-semibold text-sm">Aucun résultat ...</h3>
				<p className="text-muted-foreground text-xs">
					Essayez un autre terme de recherche.
				</p>
			</div>
		</CommandPrimitive.Empty>
	);
};

const CommandGroup = ({
	className,
	...props
}: ComponentProps<typeof CommandPrimitive.Group>) => (
	<CommandPrimitive.Group
		className={cn(
			'overflow-hidden p-1 text-foreground',
			'**:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:text-xs',
			className
		)}
		data-slot="command-group"
		{...props}
	/>
);

const CommandSeparator = ({
	className,
	...props
}: ComponentProps<typeof CommandPrimitive.Separator>) => (
	<CommandPrimitive.Separator
		className={cn('h-px bg-input', className)}
		data-slot="command-separator"
		{...props}
	/>
);

const CommandItem = ({
	className,
	...props
}: ComponentProps<typeof CommandPrimitive.Item>) => (
	<CommandPrimitive.Item
		className={cn(
			'relative flex cursor-pointer select-none items-center gap-x-2 rounded-md text-sm outline-hidden',
			'px-3 py-2 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
			"[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-theme [&_svg]:mr-1",
			'[&_span]:font-bold [&_span]:text-sm [&_span]:text-theme',
			className
		)}
		data-slot="command-item"
		{...props}
	/>
);

export {
	Command,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandSeparator,
	CommandItem,
};
