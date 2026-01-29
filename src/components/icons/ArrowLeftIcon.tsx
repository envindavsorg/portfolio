'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type React from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';

const PATH_VARIANTS: Variants = {
	normal: { d: 'm12 19-7-7 7-7', translateX: 0 },
	animate: {
		d: 'm12 19-7-7 7-7',
		translateX: [0, 3, 0],
		transition: {
			duration: 0.4,
		},
	},
};

const SECOND_PATH_VARIANTS: Variants = {
	normal: { d: 'M19 12H5' },
	animate: {
		d: ['M19 12H5', 'M19 12H10', 'M19 12H5'],
		transition: {
			duration: 0.4,
		},
	},
};

export const ArrowLeftIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
	({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
		const controls = useAnimation();
		const isControlledRef = useRef(false);

		useImperativeHandle(ref, () => {
			isControlledRef.current = true;

			return {
				startAnimation: () => controls.start('animate'),
				stopAnimation: () => controls.start('normal'),
			};
		});

		const handleMouseEnter = useCallback(
			(event: React.MouseEvent<HTMLDivElement>) => {
				if (isControlledRef.current) {
					onMouseEnter?.(event);
				} else {
					controls.start('animate');
				}
			},
			[controls, onMouseEnter]
		);

		const handleMouseLeave = useCallback(
			(event: React.MouseEvent<HTMLDivElement>) => {
				if (isControlledRef.current) {
					onMouseLeave?.(event);
				} else {
					controls.start('normal');
				}
			},
			[controls, onMouseLeave]
		);

		return (
			<div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
				<svg
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
					<motion.path animate={controls} initial="normal" variants={PATH_VARIANTS} />
					<motion.path animate={controls} initial="normal" variants={SECOND_PATH_VARIANTS} />
				</svg>
			</div>
		);
	}
);
