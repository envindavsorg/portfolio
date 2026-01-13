'use client';

import type React from 'react';
import { type HTMLAttributes, memo } from 'react';
import type { MarqueeProps as FastMarqueeProps } from 'react-fast-marquee';
import FastMarquee from 'react-fast-marquee';
import { cn } from '@/lib/utils';

export type MarqueeProps = HTMLAttributes<HTMLDivElement>;

export const Marquee = memo(
	({ className, ...props }: MarqueeProps): React.JSX.Element => (
		<div className={cn('relative w-full overflow-hidden', className)} {...props} />
	)
);

export type MarqueeContentProps = FastMarqueeProps;

export const MarqueeContent = ({
	loop = 0,
	autoFill = true,
	pauseOnHover = true,
	...props
}: MarqueeContentProps): React.JSX.Element => (
	<FastMarquee autoFill={autoFill} loop={loop} pauseOnHover={pauseOnHover} {...props} />
);

export type MarqueeFadeProps = HTMLAttributes<HTMLDivElement> & {
	side: 'left' | 'right';
};

export const MarqueeFade = ({ className, side, ...props }: MarqueeFadeProps): React.JSX.Element => (
	<div
		className={cn(
			'absolute top-0 bottom-0 z-10 h-full w-24 from-background to-transparent',
			side === 'left' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l',
			className
		)}
		{...props}
	/>
);

export type MarqueeItemProps = HTMLAttributes<HTMLDivElement>;

export const MarqueeItem = ({ className, ...props }: MarqueeItemProps): React.JSX.Element => (
	<div className={cn('mx-2 shrink-0 object-contain', className)} {...props} />
);
