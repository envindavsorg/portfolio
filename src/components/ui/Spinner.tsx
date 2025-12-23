import { CircleNotchIcon } from '@phosphor-icons/react/ssr';
import type React from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Spinner = ({
	className,
	...props
}: ComponentProps<'svg'>): React.JSX.Element => (
	<CircleNotchIcon
		aria-label="Loading"
		className={cn('size-4 animate-spin', className)}
		role="status"
		{...props}
	/>
);
