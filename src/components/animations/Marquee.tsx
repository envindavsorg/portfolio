'use client';

import { type HTMLAttributes, memo } from 'react';
import type { MarqueeProps as FastMarqueeProps } from 'react-fast-marquee';
import FastMarquee from 'react-fast-marquee';
import { cn } from '@/lib/utils';

export const Marquee = memo(
	({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
		<div
			className={cn('relative w-full overflow-hidden', className)}
			{...props}
		/>
	)
);

export const MarqueeContent = ({
	loop = 0,
	autoFill = true,
	pauseOnHover = true,
	...props
}: FastMarqueeProps) => (
	<FastMarquee
		autoFill={autoFill}
		loop={loop}
		pauseOnHover={pauseOnHover}
		{...props}
	/>
);

export const MarqueeFade = ({
	className,
	side,
	...props
}: HTMLAttributes<HTMLDivElement> & {
	side: 'left' | 'right';
}) => (
	<div
		className={cn(
			'absolute top-0 bottom-0 z-10 h-full w-24 from-background to-transparent',
			side === 'left' ? 'left-0 bg-linear-to-r' : 'right-0 bg-linear-to-l',
			className
		)}
		{...props}
	/>
);

export const MarqueeItem = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('mx-2 shrink-0 object-contain', className)} {...props} />
);
