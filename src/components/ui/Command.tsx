'use client';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { Command as CommandPrimitive } from 'cmdk';
import type React from 'react';
import { cn } from '@/lib/utils';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from './Dialog';

const Command = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive>) => (
	<CommandPrimitive
		className={cn(
			'flex h-full w-full flex-col overflow-hidden text-popover-foreground',
			className,
		)}
		data-slot="command"
		{...props}
	/>
);

const CommandDialog = ({
	title = 'Palette de commandes',
	description = 'Utilisez la barre de recherche ...',
	children,
	...props
}: React.ComponentProps<typeof Dialog> & {
	title?: string;
	description?: string;
}) => (
	<Dialog {...props}>
		<DialogHeader className="sr-only">
			<DialogTitle>{title}</DialogTitle>
			<DialogDescription asChild>
				<p>{description}</p>
			</DialogDescription>
		</DialogHeader>

		<DialogContent
			className={cn(
				'overflow-hidden p-0 max-sm:top-16 max-sm:translate-y-0',
				'bg-popover backdrop-blur-lg supports-backdrop-filter:bg-popover/90',
			)}
			data-slot="command-dialog-content"
			overlay={true}
		>
			<Command
				className={cn(
					'**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-10',
					'[&_[cmdk-group]]:px-1',
					'[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
					'[&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5',
				)}
			>
				{children}
			</Command>
		</DialogContent>
	</Dialog>
);

const CommandInput = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) => (
	<div
		className="flex h-10 items-center gap-2 border-b px-4"
		data-slot="command-input-wrapper"
	>
		<MagnifyingGlassIcon className="size-4 shrink-0 opacity-50" />
		<CommandPrimitive.Input
			className={cn(
				'flex h-10 w-full rounded-lg bg-transparent py-3 font-mono text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			data-slot="command-input"
			{...props}
		/>
	</div>
);

const CommandList = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) => (
	<CommandPrimitive.List
		className={cn(
			'max-h-80 scroll-py-0 overflow-y-auto overflow-x-hidden',
			className,
		)}
		data-slot="command-list"
		{...props}
	/>
);

const CommandEmpty = ({
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => (
	<CommandPrimitive.Empty
		className="py-8 text-center font-mono text-sm"
		data-slot="command-empty"
		{...props}
	/>
);

const CommandGroup = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) => (
	<CommandPrimitive.Group
		className={cn(
			'overflow-hidden p-1 text-foreground',
			'[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs',
			className,
		)}
		data-slot="command-group"
		{...props}
	/>
);

const CommandSeparator = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) => (
	<CommandPrimitive.Separator
		className={cn('h-px bg-border', className)}
		data-slot="command-separator"
		{...props}
	/>
);

const CommandItem = ({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) => (
	<CommandPrimitive.Item
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
			className,
		)}
		data-slot="command-item"
		{...props}
	/>
);

const CommandShortcut = ({
	className,
	...props
}: React.ComponentProps<'span'>) => (
	<span
		className={cn(
			'ml-auto text-muted-foreground text-xs tracking-widest',
			className,
		)}
		data-slot="command-shortcut"
		{...props}
	/>
);

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
};
