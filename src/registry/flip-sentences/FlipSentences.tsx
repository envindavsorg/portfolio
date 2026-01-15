'use client';

import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FlipSentencesProps {
	className?: string;
	sentences: string[];
	interval?: number;
	disableAnimation?: boolean;
}

export const FlipSentences = ({
	className,
	sentences,
	interval = 4000,
	disableAnimation = false,
}: FlipSentencesProps): React.JSX.Element => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (disableAnimation) {
			setCurrentIndex(0);
			return;
		}

		let timer: NodeJS.Timeout;

		const startTimer = () => {
			timer = setInterval(() => {
				setCurrentIndex((prev) => (prev + 1) % sentences.length);
			}, interval);
		};

		const handleVisibility = () => {
			if (document.hidden) {
				clearInterval(timer);
			} else {
				setCurrentIndex((prev) => (prev + 1) % sentences.length);
				startTimer();
			}
		};

		startTimer();
		document.addEventListener('visibilitychange', handleVisibility);

		return () => {
			clearInterval(timer);
			document.removeEventListener('visibilitychange', handleVisibility);
		};
	}, [sentences.length, interval, disableAnimation]);

	if (disableAnimation) {
		return (
			<div className={cn('relative', className)}>
				<p className="text-balance text-foreground text-sm">{sentences[0]}</p>
			</div>
		);
	}

	return (
		<div className={cn('relative overflow-hidden', className)}>
			<AnimatePresence mode="wait">
				<motion.p
					animate={{ y: 0, opacity: 1 }}
					className="text-balance text-foreground text-sm"
					exit={{ y: -10, opacity: 0 }}
					initial={{ y: 10, opacity: 0 }}
					key={sentences[currentIndex]}
					transition={{ duration: 0.25, ease: 'easeOut' }}
				>
					{sentences[currentIndex]}
				</motion.p>
			</AnimatePresence>

			<span aria-hidden="true" className="invisible block h-0">
				{[...sentences].sort((a, b) => b.length - a.length)[0]}
			</span>
		</div>
	);
};
