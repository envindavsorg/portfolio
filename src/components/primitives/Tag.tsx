import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Tag = ({ className, ...props }: ComponentProps<'span'>) => (
	<span
		className={cn(
			'inline-flex items-center',
			'rounded-lg border bg-zinc-50 px-1.5 py-0.5 text-muted-foreground text-xs dark:bg-zinc-900',
			className
		)}
		data-slot="tag"
		{...props}
	/>
);
