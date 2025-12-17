'use client';

import { Player } from '@lordicon/react';
import type React from 'react';
import Pizza from '@/lottie/pizza.json' with { type: 'json' };

type PizzaIconProps = {
	colorize?: string;
	ref?: React.Ref<Player>;
	size?: number;
	state?: 'in-pizza' | 'hover-pizza';
};

const PizzaIcon = ({
	colorize = 'var(--color-yellow-400)',
	ref,
	size = 18,
	state,
}: PizzaIconProps) => (
	<Player
		colorize={colorize}
		direction={1}
		icon={Pizza}
		ref={ref}
		renderMode="HARDWARE"
		size={size}
		state={state}
	/>
);

export { PizzaIcon };
