import type React from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Kbd = ({
	className,
	...props
}: ComponentProps<'kbd'>): React.JSX.Element => (
	<kbd
		className={cn(
			'inline-flex items-center justify-center gap-1',
			'pointer-events-none h-5 w-fit min-w-5 select-none rounded-sm bg-muted px-1',
			'font-medium font-sans text-muted-foreground text-xs',
			"[&_svg:not([class*='size-'])]:size-3",
			'[[data-slot=tooltip-content]_&]:bg-background/20 dark:[[data-slot=tooltip-content]_&]:bg-background/10',
			'[[data-slot=tooltip-content]_&]:text-background',
			className
		)}
		data-slot="kbd"
		{...props}
	/>
);

export const KbdGroup = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => (
	<kbd
		className={cn('inline-flex items-center gap-1', className)}
		data-slot="kbd-group"
		{...props}
	/>
);
