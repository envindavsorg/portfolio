'use client';

import { motion, type TargetAndTransition } from 'motion/react';
import type { ComponentProps } from 'react';

const initial: TargetAndTransition = { pathLength: 0, opacity: 0 };
const animate: TargetAndTransition = { pathLength: 1, opacity: 1 };

interface PathConfig {
	d: string;
	duration: number;
	delay?: number;
}

type CoverEffectProps = ComponentProps<typeof motion.svg> & {
	paths: PathConfig[];
	viewBox: string;
	speed?: number;
	strokeWidth?: number;
	onAnimationComplete?: () => void;
	capture?: boolean;
};

export const CoverEffect = ({
	paths,
	viewBox,
	speed = 1.25,
	strokeWidth = 15,
	onAnimationComplete,
	capture = false,
	...props
}: CoverEffectProps) => {
	const calc = (x: number) => x * speed;

	const lastIndex = paths.length - 1;
	const svgInitial = capture ? false : { opacity: 1 };
	const pathInitial = capture ? false : initial;

	return (
		<motion.svg
			exit={{ opacity: 0 }}
			fill="none"
			initial={svgInitial}
			stroke="currentColor"
			strokeWidth={strokeWidth}
			suppressHydrationWarning
			transition={{ duration: 0.5 }}
			viewBox={viewBox}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			{paths.map(({ d, duration, delay = 0 }, idx) => {
				const scaledDuration = calc(duration);
				const scaledDelay = delay > 0 ? calc(delay) : undefined;

				return (
					<motion.path
						animate={animate}
						d={d}
						initial={pathInitial}
						key={idx}
						style={{ strokeLinecap: 'round' }}
						transition={{
							duration: scaledDuration,
							ease: 'easeInOut',
							...(scaledDelay && { delay: scaledDelay }),
							opacity: {
								duration: Math.min(scaledDuration, 0.4),
								...(scaledDelay && { delay: scaledDelay }),
							},
						}}
						{...(idx === lastIndex &&
							onAnimationComplete && {
								onAnimationComplete,
							})}
					/>
				);
			})}
		</motion.svg>
	);
};
