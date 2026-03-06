'use client';

import { motion } from 'motion/react';
import { forwardRef } from 'react';
import useAnimatedIcon from '@/hooks/useAnimatedIcon';

export const ArrowDownAtoZ = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
					<path d="m3 16 4 4 4-4" />
					<path d="M7 20V4" />
					<motion.g
						animate={controls}
						custom={1}
						initial="normal"
						transition={{
							type: 'spring',
							stiffness: 240,
							damping: 24,
						}}
						variants={{
							normal: {
								translateY: 0,
							},
							animate: (custom: number) => ({
								translateY: custom * 10,
							}),
						}}
					>
						<path d="M20 8h-5" />
						<path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
					</motion.g>
					<motion.path
						animate={controls}
						custom={-1}
						d="M15 14h5l-5 6h5"
						initial="normal"
						transition={{
							type: 'spring',
							stiffness: 240,
							damping: 24,
						}}
						variants={{
							normal: {
								translateY: 0,
							},
							animate: (custom: number) => ({
								translateY: custom * 10,
							}),
						}}
					/>
				</svg>
			</div>
		);
	}
);
