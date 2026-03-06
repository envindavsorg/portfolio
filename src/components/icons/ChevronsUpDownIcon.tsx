'use client';

import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import { forwardRef } from 'react';
import useAnimatedIcon from '@/hooks/useAnimatedIcon';

const DEFAULT_TRANSITION: Transition = {
	type: 'spring',
	stiffness: 250,
	damping: 25,
};

export const ChevronsUpDownIcon = forwardRef<
	AnimatedIconHandle,
	AnimatedIconProps
>(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
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
				<motion.path
					animate={controls}
					d="m7 15 5 5 5-5"
					initial="normal"
					transition={DEFAULT_TRANSITION}
					variants={{
						normal: { translateY: '0%' },
						animate: { translateY: '2px' },
					}}
				/>
				<motion.path
					animate={controls}
					d="m7 9 5-5 5 5"
					initial="normal"
					transition={DEFAULT_TRANSITION}
					variants={{
						normal: { translateY: '0%' },
						animate: { translateY: '-2px' },
					}}
				/>
			</svg>
		</div>
	);
});
