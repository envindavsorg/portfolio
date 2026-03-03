'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface FlipSentencesProps {
	className?: string;
	sentences: string[];
	interval?: number;
	disableAnimation?: boolean;
}

const sentenceVariants = {
	initial: { y: 10, opacity: 0 },
	animate: { y: 0, opacity: 1 },
	exit: { y: -10, opacity: 0 },
} as const;

const sentenceTransition = {
	duration: 0.25,
	ease: 'easeOut',
} as const;

export const FlipSentences = ({
	className,
	sentences,
	interval = 4000,
	disableAnimation = false,
}: FlipSentencesProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const sentenceCount = sentences.length;

	const longestSentence = useMemo(() => sentences.reduce((a, b) => (b.length > a.length ? b : a), ''), [sentences]);

	useEffect(() => {
		if (disableAnimation) {
			setCurrentIndex(0);
			return;
		}

		const advance = () => setCurrentIndex((prev) => (prev + 1) % sentenceCount);

		let timer = setInterval(advance, interval);

		const handleVisibility = () => {
			clearInterval(timer);
			if (!document.hidden) {
				advance();
				timer = setInterval(advance, interval);
			}
		};

		document.addEventListener('visibilitychange', handleVisibility);

		return () => {
			clearInterval(timer);
			document.removeEventListener('visibilitychange', handleVisibility);
		};
	}, [sentenceCount, interval, disableAnimation]);

	if (disableAnimation) {
		return <p className={cn('font-medium text-theme text-xs sm:text-sm', className)}>{sentences[0]}</p>;
	}

	return (
		<div className={cn('relative overflow-hidden', className)}>
			<AnimatePresence mode="wait">
				<motion.p
					animate="animate"
					className="font-medium text-theme text-xs sm:text-sm"
					exit="exit"
					initial="initial"
					key={currentIndex}
					transition={sentenceTransition}
					variants={sentenceVariants}
				>
					{sentences[currentIndex]}
				</motion.p>
			</AnimatePresence>

			<span aria-hidden="true" className="invisible block h-0">
				{longestSentence}
			</span>
		</div>
	);
};
