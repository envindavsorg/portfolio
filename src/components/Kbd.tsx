import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const Kbd = ({ className, ...props }: ComponentProps<'kbd'>) => (
	<kbd
		className={cn(
			'inline-flex items-center justify-center gap-1',
			'pointer-events-none h-5 w-fit min-w-5 select-none rounded-sm bg-muted px-1',
			'font-medium text-muted-foreground text-sm',
			"[&_svg:not([class*='size-'])]:size-3",
			'[[data-slot=tooltip-content]_&]:bg-background/20 dark:[[data-slot=tooltip-content]_&]:bg-background/10',
			'[[data-slot=tooltip-content]_&]:text-background',
			className
		)}
		data-slot="kbd"
		{...props}
	/>
);

Kbd.displayName = 'Kbd';

const KbdGroup = ({ className, ...props }: ComponentProps<'div'>) => (
	<kbd className={cn('inline-flex items-center gap-x-2', className)} data-slot="kbd-group" {...props} />
);

KbdGroup.displayName = 'KbdGroup';

export { Kbd, KbdGroup };
