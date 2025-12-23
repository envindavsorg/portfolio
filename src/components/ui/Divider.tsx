import type React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
	className?: string;
	border?: boolean;
}

export const Divider = ({
	className,
	border = false,
}: DividerProps): React.JSX.Element => (
	<div
		className={cn(
			'h-8',
			border && 'relative flex w-full border-edge border-x',
			'before:absolute before:-left-[100vw] before:-z-1 before:h-8 before:w-[200vw]',
			'before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]',
			'before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/56',
			className
		)}
	/>
);
