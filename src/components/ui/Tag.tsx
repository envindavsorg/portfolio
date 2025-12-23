import type React from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Tag = ({
	className,
	...props
}: ComponentProps<'span'>): React.JSX.Element => (
	<span
		className={cn(
			'inline-flex items-center',
			'rounded-lg border bg-zinc-50 px-1.5 py-0.5 dark:bg-zinc-900',
			'font-mono text-muted-foreground text-xs',
			className
		)}
		data-slot="tag"
		{...props}
	/>
);
