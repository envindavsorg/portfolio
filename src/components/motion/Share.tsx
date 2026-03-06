'use client';

import { motion } from 'motion/react';
import { forwardRef } from 'react';
import useAnimatedIcon from '@/hooks/useAnimatedIcon';

export const Share = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<motion.g
						animate={controls}
						variants={{
							normal: { y: 0 },
							animate: {
								y: -2,
								transition: {
									type: 'spring',
									stiffness: 200,
									damping: 10,
									mass: 1,
								},
							},
						}}
					>
						<polyline points="17 8 12 3 7 8" />
						<line x1="12" x2="12" y1="3" y2="15" />
					</motion.g>
				</svg>
			</div>
		);
	}
);
