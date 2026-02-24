'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import { AudioLinesIcon } from '@/components/blocks/icons/AudioLinesIcon';
import { PlayIcon } from '@/components/blocks/icons/PlayIcon';
import { Button } from '@/components/primitives/Button';
import { soundManager } from '@/lib/sound-manager';

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
		if (isPlayingRef.current) {
			return;
		}

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

	const handleMouseEnter = useCallback(() => {
		playIconRef.current?.startAnimation?.();
	}, []);

	const handleMouseLeave = useCallback(() => {
		playIconRef.current?.stopAnimation?.();
	}, []);

	const handleIconAnimationComplete = useCallback(() => {
		if (isPlaying) {
			playingIconRef.current?.startAnimation?.();
		}
	}, [isPlaying]);

	const animationKey = isPlaying ? 'playing' : 'idle';

	return (
		<MotionButton
			aria-label="Prononciation de mon prénom. Cliquez pour écouter."
			className={className}
			onClick={handlePlay}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			size="icon"
			variant="outline"
		>
			<AnimatePresence initial={false} mode="wait">
				<motion.div
					animate="animate"
					exit="exit"
					initial="initial"
					key={animationKey}
					onAnimationComplete={handleIconAnimationComplete}
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
