'use client';

import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useState } from 'react';
import { ToggleButton } from '@/features/root/about/elements/ToggleButton';

type ToggleContentProps = {
	children: React.ReactNode;
};

export const ToggleContent = ({ children }: ToggleContentProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<>
			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						initial={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>

			<ToggleButton
				isExpanded={isExpanded}
				setIsExpanded={setIsExpanded}
			/>
		</>
	);
};
