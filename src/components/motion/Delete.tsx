'use client';

import { motion } from 'motion/react';
import { forwardRef } from 'react';
import useAnimatedIcon from '@/hooks/useAnimatedIcon';

export const DeleteIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
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
					<motion.g
						animate={controls}
						transition={{
							type: 'spring',
							stiffness: 500,
							damping: 30,
						}}
						variants={{
							normal: { y: 0 },
							animate: { y: -1.1 },
						}}
					>
						<path d="M3 6h18" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					</motion.g>
					<motion.path
						animate={controls}
						d="M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8"
						transition={{
							type: 'spring',
							stiffness: 500,
							damping: 30,
						}}
						variants={{
							normal: { d: 'M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8' },
							animate: { d: 'M19 9v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V9' },
						}}
					/>
					<motion.line
						animate={controls}
						transition={{
							type: 'spring',
							stiffness: 500,
							damping: 30,
						}}
						variants={{
							normal: { y1: 11, y2: 17 },
							animate: { y1: 11.5, y2: 17.5 },
						}}
						x1="10"
						x2="10"
						y1="11"
						y2="17"
					/>
					<motion.line
						animate={controls}
						transition={{
							type: 'spring',
							stiffness: 500,
							damping: 30,
						}}
						variants={{
							normal: { y1: 11, y2: 17 },
							animate: { y1: 11.5, y2: 17.5 },
						}}
						x1="14"
						x2="14"
						y1="11"
						y2="17"
					/>
				</svg>
			</div>
		);
	}
);
