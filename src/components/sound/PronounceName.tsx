'use client';

import { SpeakerHighIcon } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import type React from 'react';
import { soundManager } from '@/lib/sound-manager';
import { USER } from '@/lib/user';
import { cn } from '@/lib/utils';

type PronounceNameProps = {
	sound: string;
	className?: string;
};

export const PronounceName = ({
	sound,
	className,
}: PronounceNameProps): React.JSX.Element => (
	<motion.button
		aria-label={`${USER.firstName} ${USER.lastName}`}
		className={cn(
			'relative translate-y-px select-none',
			'cursor-pointer text-muted-foreground hover:text-foreground',
			className
		)}
		onClick={() => soundManager.playAudio(sound)}
		title={`${USER.firstName} ${USER.lastName}`}
		type="button"
		whileHover={{ scale: 1.1 }}
		whileTap={{ scale: 0.9 }}
	>
		<SpeakerHighIcon className="size-5" />
		<span className="sr-only">{`${USER.firstName} ${USER.lastName}`}</span>
	</motion.button>
);
