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

	return (
		<motion.svg
			exit={{ opacity: 0 }}
			fill="none"
			initial={capture ? false : { opacity: 1 }}
			stroke="currentColor"
			strokeWidth={strokeWidth}
			suppressHydrationWarning
			transition={{ duration: 0.5 }}
			viewBox={viewBox}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			{paths.map(({ d, duration, delay = 0 }, idx: number) => {
				const isLast = idx === paths.length - 1;
				return (
					<motion.path
						animate={animate}
						d={d}
						initial={capture ? false : initial}
						key={idx}
						style={{ strokeLinecap: 'round' }}
						transition={{
							duration: calc(duration),
							ease: 'easeInOut',
							...(delay > 0 && { delay: calc(delay) }),
							opacity: {
								duration: Math.min(calc(duration), 0.4),
								...(delay > 0 && { delay: calc(delay) }),
							},
						}}
						{...(isLast && onAnimationComplete && { onAnimationComplete })}
					/>
				);
			})}
		</motion.svg>
	);
};
