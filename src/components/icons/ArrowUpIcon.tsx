'use client';

import { Player } from '@lordicon/react';
import type React from 'react';
import ArrowUp from '@/lottie/arrow-up.json' with { type: 'json' };

type ArrowUpIconProps = {
	colorize?: string;
	ref?: React.Ref<Player>;
	size?: number;
	state?: 'in-arrow-up' | 'hover-arrow-up-1' | 'hover-arrow-up-2';
};

const ArrowUpIcon = ({
	colorize = 'var(--color-foreground)',
	ref,
	size = 24,
	state,
}: ArrowUpIconProps) => (
	<Player
		colorize={colorize}
		direction={1}
		icon={ArrowUp}
		ref={ref}
		renderMode="HARDWARE"
		size={size}
		state={state}
	/>
);

export { ArrowUpIcon };
