import { CircleNotchIcon } from '@phosphor-icons/react/ssr';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Spinner = ({ className, ...props }: ComponentProps<'svg'>) => (
	<CircleNotchIcon
		aria-label="Loading"
		className={cn('size-4 animate-spin', className)}
		role="status"
		{...props}
	/>
);
