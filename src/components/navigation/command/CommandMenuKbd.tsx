import type React from 'react';
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
