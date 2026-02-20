import { cn } from '@/lib/utils';

interface DividerProps {
	type?: 'full' | 'half';
	before?: boolean;
	after?: boolean;
	border?: boolean;
	className?: string;
}

export const Divider = ({
	type = 'full',
	before = true,
	after = true,
	border = true,
	className,
}: DividerProps) => (
	<div
		className={cn(before && 'screen-line-before', after && 'screen-line-after')}
	>
		<div
			className={cn(
				className,
				type === 'full' && 'h-8 before:h-8',
				type === 'half' && 'h-4 before:h-4',
				border && 'border-edge border-x',
				'relative flex w-full',
				'before:absolute before:-left-[100vw] before:-z-1 before:w-[200vw]',
				'before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]',
				'before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/50'
			)}
		/>
	</div>
);
