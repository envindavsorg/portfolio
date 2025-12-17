'use client';

import { Player } from '@lordicon/react';
import type React from 'react';
import Heart from '@/lottie/heart.json' with { type: 'json' };

type HeartIconProps = {
	colorize?: string;
	ref?: React.Ref<Player>;
	size?: number;
	state?: 'in-reveal' | 'hover-pinch' | 'morph-select';
};

const HeartIcon = ({
	colorize = 'light-dark(var(--color-red-600), var(--color-red-300))',
	ref,
	size = 18,
	state,
}: HeartIconProps) => (
	<Player
		colorize={colorize}
		direction={1}
		icon={Heart}
		ref={ref}
		renderMode="HARDWARE"
		size={size}
		state={state}
	/>
);

export { HeartIcon };
