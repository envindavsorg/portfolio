'use client';

import { Player } from '@lordicon/react';
import type React from 'react';
import Pizza from '@/lottie/warning.json' with { type: 'json' };

type WarningIconProps = {
	colorize?: string;
	ref?: React.Ref<Player>;
	size?: number;
	state?: 'in-error' | 'hover-error-1' | 'hover-error-2';
	onCompleteAction: () => void | undefined;
};

export const WarningIcon = ({
	colorize = 'var(--color-destructive)',
	ref,
	size = 18,
	state,
	onCompleteAction,
}: WarningIconProps) => (
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
