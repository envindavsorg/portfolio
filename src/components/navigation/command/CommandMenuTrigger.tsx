import { CommandIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import type React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const CommandMenuKbd = ({
	className,
	...props
}: React.ComponentProps<'kbd'>): React.JSX.Element => (
	<kbd
		className={cn(
			"pointer-events-none flex h-5 min-w-6 select-none items-center justify-center gap-1 rounded-sm bg-black/5 px-1 font-normal font-sans text-[13px] text-foreground shadow-[inset_0_-1px_2px] shadow-black/10 dark:bg-white/10 dark:text-shadow-xs dark:shadow-white/10 [&_svg:not([class*='size-'])]:size-3",
			className,
		)}
		{...props}
	/>
);

type CommandMenuTriggerProps = {
	setOpen: (open: boolean) => void;
};

export const CommandMenuTrigger = ({
	setOpen,
}: CommandMenuTriggerProps): React.JSX.Element => (
	<Button
		className={cn(
			'h-8 select-none gap-1.5 rounded-full px-2.5',
			'border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0',
		)}
		onClick={() => setOpen(true)}
		variant="outline"
	>
		<MagnifyingGlassIcon />

		<span className="font-medium font-sans text-xs/4 sm:hidden">
			Rechercher
		</span>

		<CommandMenuKbd className="hidden sm:in-[.os-macos_&]:flex">
			<div className="flex items-center gap-x-0.5 tracking-wide">
				<CommandIcon className="size-3" />K
			</div>
		</CommandMenuKbd>
		<CommandMenuKbd className="hidden tracking-wide sm:not-[.os-macos_&]:flex">
			ctrl + K
		</CommandMenuKbd>
	</Button>
);
