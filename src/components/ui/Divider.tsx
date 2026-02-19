import { cn } from '@/lib/utils';

interface DividerProps {
	type?: 'full' | 'half';
}

export const Divider = ({ type = 'full' }: DividerProps) => (
	<div className="screen-line-before screen-line-after">
		<div
			className={cn(
				type === 'full' && 'h-8 before:h-8',
				type === 'half' && 'h-4 before:h-4',
				'relative flex w-full border-edge border-x',
				'before:absolute before:-left-[100vw] before:-z-1 before:w-[200vw]',
				'before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]',
				'before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/50'
			)}
		/>
	</div>
);
