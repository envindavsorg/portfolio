'use client';

import { Player } from '@lordicon/react';
import type React from 'react';
import Pizza from '@/lottie/plane.json' with { type: 'json' };

type PlaneIconProps = {
	colorize?: string;
	ref?: React.Ref<Player>;
	size?: number;
	state?: 'in-takeoff' | 'hover-takeoff';
	onCompleteAction: () => void | undefined;
};

export const PlaneIcon = ({
	colorize = 'var(--color-theme)',
	ref,
	size = 18,
	state,
	onCompleteAction,
}: PlaneIconProps) => (
	<Player
		colorize={colorize}
		direction={1}
		icon={Pizza}
		onComplete={onCompleteAction}
		ref={ref}
		renderMode="HARDWARE"
		size={size}
		state={state}
	/>
);
