'use client';

import { Label as Primitive } from 'radix-ui';
import type React from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Label = ({
	className,
	...props
}: ComponentProps<typeof Primitive.Root>): React.JSX.Element => (
	<Primitive.Root
		className={cn(
			'flex items-center gap-2',
			'select-none font-medium text-sm leading-none',
			'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
			'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
			className
		)}
		data-slot="label"
		{...props}
	/>
);
