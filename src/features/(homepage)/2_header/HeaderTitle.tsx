'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/buttons/Button';
import { AudioLinesIcon } from '@/components/icons/AudioLinesIcon';
import { PlayIcon } from '@/components/icons/PlayIcon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/Tooltip';
import { TextAnimate } from '@/components/text/TextAnimate';
import { soundManager } from '@/lib/sound-manager';

const MotionButton = motion.create(Button);

const iconVariants = {
	initial: { opacity: 0, scale: 0.5 },
	animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
	exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
} as const;

interface HeaderTitleProps {
	name: string;
	pronunciation: string;
	capture?: boolean;
}

export const HeaderTitle = ({
	name,
	pronunciation,
	capture,
}: HeaderTitleProps) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const playIconRef = useRef<AnimatedIconHandle>(null);
	const playingIconRef = useRef<AnimatedIconHandle>(null);

	const handlePlay = useCallback(async () => {
		if (isPlaying) {
			return;
		}

		try {
			setIsPlaying(true);
			await soundManager.playAudio(pronunciation);
		} catch (error) {
			console.error('Audio playback failed', error);
		} finally {
			setIsPlaying(false);
		}
	}, [isPlaying, pronunciation]);

	const handleMouseEnter = useCallback(() => {
		playIconRef.current?.startAnimation?.();
	}, []);

	const handleMouseLeave = useCallback(() => {
		playIconRef.current?.stopAnimation?.();
	}, []);

	return (
		<div className="flex w-full items-center justify-between gap-x-3 border-edge border-t px-2 py-1 sm:px-4">
			<h1 className="sr-only">{name}</h1>
			<TextAnimate
				animation="blurInUp"
				by="character"
				className="text-balance font-extrabold text-2xl leading-snug sm:text-4xl"
				delay={0.75}
				once
			>
				{name}
			</TextAnimate>

			{!capture && (
				<Tooltip>
					<TooltipTrigger asChild>
						<MotionButton
							onClick={handlePlay}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							size="icon"
							variant="outline"
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
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

							<span className="sr-only">{name}</span>
						</MotionButton>
					</TooltipTrigger>
					<TooltipContent offset={-2}>Écouter la prononciation</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
};
