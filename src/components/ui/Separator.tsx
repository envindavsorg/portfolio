'use client';

import { Separator as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Separator = ({
	className,
	orientation = 'horizontal',
	decorative = true,
	...props
}: ComponentProps<typeof Primitive.Root>) => (
	<Primitive.Root
		className={cn(
			'shrink-0 bg-border',
			'data-[orientation=horizontal]:h-px',
			'data-[orientation=vertical]:h-full',
			'data-[orientation=horizontal]:w-full',
			'data-[orientation=vertical]:w-px',
			className
		)}
		data-slot="separator"
		decorative={decorative}
		orientation={orientation}
		{...props}
	/>
);
