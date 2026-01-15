'use client';

import { motion } from 'motion/react';
import type React from 'react';
import { useRef } from 'react';
import { AudioLinesIcon } from '@/components/icons/AudioLinesIcon';
import { soundManager } from '@/lib/sound-manager';
import { USER } from '@/lib/user';

const HeaderPronounceName = (): React.JSX.Element => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<motion.button
			aria-label={`${USER.firstName} ${USER.lastName}`}
			className="relative translate-y-px cursor-pointer select-none text-muted-foreground hover:text-foreground"
			onClick={async () => {
				iconRef.current?.startAnimation?.();
				await soundManager.playAudio(USER.namePronunciationUrl);
				iconRef.current?.stopAnimation?.();
			}}
			title={`${USER.firstName} ${USER.lastName}`}
			type="button"
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
		>
			<AudioLinesIcon ref={iconRef} />
			<span className="sr-only">{`${USER.firstName} ${USER.lastName}`}</span>
		</motion.button>
	);
};

HeaderPronounceName.displayName = 'HeaderPronounceName';

export { HeaderPronounceName };
