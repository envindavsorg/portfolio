'use client';

import { CaretDownIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AboutExpandableProps {
	intro: React.ReactNode;
	moreContent?: React.ReactNode;
}

export const AboutExpandable = ({
	intro,
	moreContent,
}: AboutExpandableProps): React.JSX.Element => {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!moreContent) {
		return <>{intro}</>;
	}

	return (
		<>
			{intro}

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						animate={{
							opacity: 1,
							height: 'auto',
						}}
						className="overflow-hidden"
						exit={{
							opacity: 0,
							height: 0,
						}}
						id="about-content-expanded"
						initial={{
							opacity: 0,
							height: 0,
						}}
						transition={{
							duration: 0.3,
							ease: [0.4, 0, 0.2, 1],
						}}
					>
						<div className="mt-4">{moreContent}</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="screen-line-before flex justify-center py-2 md:justify-end">
				<Button
					aria-controls="about-content-expanded"
					aria-expanded={isExpanded}
					onClick={() => setIsExpanded(!isExpanded)}
					variant="secondary"
				>
					{isExpanded ? 'Voir moins' : 'Voir plus'}
					<CaretDownIcon
						className={cn(
							'ml-2 size-4 transition-transform duration-300',
							isExpanded && 'rotate-180'
						)}
					/>
				</Button>
			</div>
		</>
	);
};
