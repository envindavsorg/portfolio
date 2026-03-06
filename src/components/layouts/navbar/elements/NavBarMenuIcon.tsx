'use client';

import { motion, useAnimation } from 'motion/react';
import type React from 'react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NavBarMenuIconProps extends React.ComponentProps<'div'> {
	isOpen: boolean;
	size?: number;
}

export const MenuIcon = ({
	isOpen,
	className,
	size = 28,
	...props
}: NavBarMenuIconProps) => {
	const controls = useAnimation();

	useEffect(() => {
		controls.start(isOpen ? 'animate' : 'normal');
	}, [isOpen, controls]);

	return (
		<div className={cn('select-none', className)} {...props}>
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
				<motion.line
					animate={controls}
					custom={1}
					initial="normal"
					variants={{
						normal: {
							rotate: 0,
							y: 0,
							opacity: 1,
						},
						animate: (custom: number) => ({
							rotate: custom === 1 ? 45 : custom === 3 ? -45 : 0,
							y: custom === 1 ? 6 : custom === 3 ? -6 : 0,
							opacity: custom === 2 ? 0 : 1,
							transition: {
								type: 'spring',
								stiffness: 260,
								damping: 20,
							},
						}),
					}}
					x1="4"
					x2="20"
					y1="6"
					y2="6"
				/>
				<motion.line
					animate={controls}
					custom={2}
					initial="normal"
					variants={{
						normal: {
							rotate: 0,
							y: 0,
							opacity: 1,
						},
						animate: (custom: number) => ({
							rotate: custom === 1 ? 45 : custom === 3 ? -45 : 0,
							y: custom === 1 ? 6 : custom === 3 ? -6 : 0,
							opacity: custom === 2 ? 0 : 1,
							transition: {
								type: 'spring',
								stiffness: 260,
								damping: 20,
							},
						}),
					}}
					x1="4"
					x2="20"
					y1="12"
					y2="12"
				/>
				<motion.line
					animate={controls}
					custom={3}
					initial="normal"
					variants={{
						normal: {
							rotate: 0,
							y: 0,
							opacity: 1,
						},
						animate: (custom: number) => ({
							rotate: custom === 1 ? 45 : custom === 3 ? -45 : 0,
							y: custom === 1 ? 6 : custom === 3 ? -6 : 0,
							opacity: custom === 2 ? 0 : 1,
							transition: {
								type: 'spring',
								stiffness: 260,
								damping: 20,
							},
						}),
					}}
					x1="4"
					x2="20"
					y1="18"
					y2="18"
				/>
			</svg>
		</div>
	);
};
