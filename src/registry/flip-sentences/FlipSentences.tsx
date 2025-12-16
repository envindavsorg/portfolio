'use client';

import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type FlipSentencesProps = {
	className?: string;
	sentences: string[];
	interval?: number;
	disableAnimation?: boolean;
};

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
				<p className="text-balance font-mono text-muted-foreground text-sm">
					{sentences[0]}
				</p>
			</div>
		);
	}

	return (
		<div className={cn('relative overflow-hidden', className)}>
			<AnimatePresence mode="wait">
				<motion.p
					key={sentences[currentIndex]}
					initial={{ y: 10, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: -10, opacity: 0 }}
					transition={{ duration: 0.25, ease: 'easeOut' }}
					className="text-balance font-mono text-muted-foreground text-sm"
				>
					{sentences[currentIndex]}
				</motion.p>
			</AnimatePresence>

			<span className="invisible block h-0" aria-hidden="true">
				{[...sentences].sort((a, b) => b.length - a.length)[0]}
			</span>
		</div>
	);
};
