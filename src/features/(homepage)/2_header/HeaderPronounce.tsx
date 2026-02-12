'use client';

import { Button } from '@/components/buttons/Button';
import { AudioLinesIcon } from '@/components/icons/AudioLinesIcon';
import { PlayIcon } from '@/components/icons/PlayIcon';
import { soundManager } from '@/lib/sound-manager';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';

const MotionButton = motion.create(Button);

const iconVariants = {
	initial: { opacity: 0, scale: 0.5 },
	animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
	exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
} as const;

interface HeaderPronounceProps {
	pronunciation: string;
	className?: string;
}

export const HeaderPronounce = ({
	pronunciation,
	className,
}: HeaderPronounceProps) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const isPlayingRef = useRef(false);
	const playIconRef = useRef<AnimatedIconHandle>(null);
	const playingIconRef = useRef<AnimatedIconHandle>(null);

	const handlePlay = useCallback(async () => {
		if (isPlayingRef.current) return;

		try {
			isPlayingRef.current = true;
			setIsPlaying(true);
			await soundManager.playAudio(pronunciation);
		} catch (error) {
			console.error('Audio playback failed', error);
		} finally {
			isPlayingRef.current = false;
			setIsPlaying(false);
		}
	}, [pronunciation]);

	return (
		<MotionButton
			onClick={handlePlay}
			onMouseEnter={() => playIconRef.current?.startAnimation?.()}
			onMouseLeave={() => playIconRef.current?.stopAnimation?.()}
			size="icon"
			variant="outline"
			className={className}
		>
			<AnimatePresence initial={false} mode="wait">
				<motion.div
					animate="animate"
					exit="exit"
					initial="initial"
					key={isPlaying ? 'playing' : 'idle'}
					onAnimationComplete={() => {
						if (isPlaying) {
							playingIconRef.current?.startAnimation?.();
						}
					}}
					variants={iconVariants}
				>
					{isPlaying ? (
						<AudioLinesIcon ref={playingIconRef} />
					) : (
						<PlayIcon ref={playIconRef} />
					)}
				</motion.div>
			</AnimatePresence>
		</MotionButton>
	);
};
