'use client';

import type { Transition, Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type React from 'react';
import { forwardRef, type HTMLAttributes, useCallback, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface LlmIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface LlmIconProps extends HTMLAttributes<HTMLDivElement> {
	size?: number;
}

const TRANSITION: Transition = {
	duration: 0.3,
	opacity: { delay: 0.15 },
};

const VARIANTS: Variants = {
	normal: {
		pathLength: 1,
		opacity: 1,
	},
	animate: (custom: number) => ({
		pathLength: [0, 1],
		opacity: [0, 1],
		transition: {
			...TRANSITION,
			delay: 0.1 * custom,
		},
	}),
};

export const LlmIcon = forwardRef<LlmIconHandle, LlmIconProps>(
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
					<motion.rect animate={controls} custom={0} height="8" rx="2" variants={VARIANTS} width="8" x="3" y="3" />
					<motion.path animate={controls} custom={3} d="M7 11v4a2 2 0 0 0 2 2h4" variants={VARIANTS} />
					<motion.rect animate={controls} custom={0} height="8" rx="2" variants={VARIANTS} width="8" x="13" y="13" />
				</svg>
			</div>
		);
	}
);
