'use client';

import { motion } from 'motion/react';
import { forwardRef } from 'react';
import useAnimatedIcon from '@/hooks/useAnimatedIcon';

const WIFI_LEVELS = [
	{ d: 'M12 20h.01', initialOpacity: 1, delay: 0 },
	{ d: 'M8.5 16.429a5 5 0 0 1 7 0', initialOpacity: 1, delay: 0.1 },
	{ d: 'M5 12.859a10 10 0 0 1 14 0', initialOpacity: 1, delay: 0.2 },
	{ d: 'M2 8.82a15 15 0 0 1 20 0', initialOpacity: 1, delay: 0.3 },
];

export const Rss = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
	({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
		const { controls, handleMouseEnter, handleMouseLeave } = useAnimatedIcon(
			ref,
			onMouseEnter,
			onMouseLeave
		);

		return (
			<div
				className={className}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				{...props}
			>
				<svg
					aria-hidden="true"
					className="rotate-45"
					fill="none"
					height={size}
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					viewBox="0 0 24 24"
					width={size}
					xmlns="http://www.w3.org/2000/svg"
				>
					{WIFI_LEVELS.map((level, index) => (
						<motion.path
							animate={controls}
							d={level.d}
							initial={{ opacity: level.initialOpacity }}
							key={index}
							variants={{
								fadeOut: {
									opacity: index === 0 ? 1 : 0,
									transition: { duration: 0.2 },
								},
								fadeIn: {
									opacity: 1,
									transition: {
										type: 'spring',
										stiffness: 300,
										damping: 20,
										delay: level.delay,
									},
								},
							}}
						/>
					))}
				</svg>
			</div>
		);
	}
);
