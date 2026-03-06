'use client';

import { AnimatePresence, motion } from 'motion/react';
import { forwardRef, useEffect, useState } from 'react';
import useAnimatedIcon from '@/hooks/useAnimatedIcon';

const KEYBOARD_PATHS = [
	{ id: 'key1', d: 'M10 8h.01' },
	{ id: 'key2', d: 'M12 12h.01' },
	{ id: 'key3', d: 'M14 8h.01' },
	{ id: 'key4', d: 'M16 12h.01' },
	{ id: 'key5', d: 'M18 8h.01' },
	{ id: 'key6', d: 'M6 8h.01' },
	{ id: 'key7', d: 'M7 16h10' },
	{ id: 'key8', d: 'M8 12h.01' },
];

export const Keyboard = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
	({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
		const [isHovered, setIsHovered] = useState(false);

		const { controls, handleMouseEnter, handleMouseLeave } = useAnimatedIcon(
			ref,
			onMouseEnter,
			onMouseLeave,
			{
				startAnimation: () => setIsHovered(true),
				stopAnimation: () => setIsHovered(false),
			}
		);

		useEffect(() => {
			const animateKeys = async () => {
				if (isHovered) {
					await controls.start((i) => ({
						opacity: [1, 0.2, 1],
						transition: {
							duration: 1.5,
							times: [0, 0.5, 1],
							delay: i * 0.2 * Math.random(),
							repeat: 1,
							repeatType: 'reverse',
						},
					}));
				} else {
					controls.stop();
					controls.set({ opacity: 1 });
				}
			};

			animateKeys();
		}, [isHovered, controls]);

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
					<rect height="16" rx="2" width="20" x="2" y="4" />
					<AnimatePresence>
						{KEYBOARD_PATHS.map((path, index) => (
							<motion.path
								animate={controls}
								custom={index}
								d={path.d}
								initial={{ opacity: 1 }}
								key={path.id}
							/>
						))}
					</AnimatePresence>
				</svg>
			</div>
		);
	}
);
