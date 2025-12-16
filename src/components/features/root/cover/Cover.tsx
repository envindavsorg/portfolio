'use client';

import { AnimatePresence } from 'motion/react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Context } from '@/components/features/root/cover/Context';
import {
	GREETINGS,
	GREETINGS_FADE_DELAY,
	GREETINGS_MAP,
	type Greeting,
} from '@/components/features/root/cover/constants/constants';
import { cn } from '@/lib/utils';

export type CoverProps = {
	loop?: boolean;
	capture?: boolean;
};

export const Cover = ({
	loop = true,
	capture = false,
}: CoverProps): React.JSX.Element => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [shouldAdvance, setShouldAdvance] = useState(false);

	useEffect(() => {
		if (!shouldAdvance) {
			return;
		}

		const timer = setTimeout(() => {
			setCurrentIndex((prev: number) => (prev + 1) % GREETINGS.length);
			setShouldAdvance(false);
		}, GREETINGS_FADE_DELAY);

		return () => clearTimeout(timer);
	}, [shouldAdvance]);

	const handleAnimationComplete = useCallback(() => {
		if (!loop && currentIndex === GREETINGS.length - 1) {
			return;
		}

		setShouldAdvance(true);
	}, [loop, currentIndex]);

	const currentGreeting: Greeting = GREETINGS[currentIndex];
	const { Component, className } = GREETINGS_MAP[currentGreeting];

	return (
		<Context>
			<div
				className={cn(
					'flex select-none items-center justify-center border-edge border-x text-foreground',
					'screen-line-before screen-line-after before:-top-px after:-bottom-px aspect-2/1 sm:aspect-3/1',
					'bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)]',
					'bg-black/0.75 bg-center bg-size-[10px_10px] dark:bg-white/0.75',
					'[--pattern-foreground:var(--color-zinc-950)]/5 dark:[--pattern-foreground:var(--color-white)]/5',
				)}
			>
				<AnimatePresence mode="wait">
					<Component
						key={currentGreeting}
						className={className}
						onAnimationComplete={handleAnimationComplete}
						speed={1}
						strokeWidth={15}
						capture={capture}
					/>
				</AnimatePresence>
			</div>
		</Context>
	);
};
