'use client';

import { motion } from 'motion/react';
import { useRef } from 'react';
import { AudioLinesIcon } from '@/components/icons/AudioLinesIcon';
import GLOBAL_DATA from '@/content/data/global';
import { soundManager } from '@/lib/sound-manager';

const HeaderPronounceName = () => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<motion.button
			aria-label={GLOBAL_DATA.USER.fullName}
			className="relative translate-y-px cursor-pointer select-none text-muted-foreground hover:text-foreground"
			onClick={async () => {
				iconRef.current?.startAnimation?.();
				await soundManager.playAudio(GLOBAL_DATA.USER.pronunciation);
				iconRef.current?.stopAnimation?.();
			}}
			title={GLOBAL_DATA.USER.fullName}
			type="button"
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
		>
			<AudioLinesIcon ref={iconRef} />
			<span className="sr-only">{GLOBAL_DATA.USER.fullName}</span>
		</motion.button>
	);
};

HeaderPronounceName.displayName = 'HeaderPronounceName';

export { HeaderPronounceName };
