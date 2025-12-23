import type { FilePngIcon, FileSvgIcon } from '@phosphor-icons/react';
import type { motion } from 'motion/react';
import type { ComponentProps } from 'react';
import type { GREETINGS, GREETINGS_CONFIG } from '../constants/constants';

export type EffectProps = ComponentProps<typeof motion.svg> & {
	speed?: number;
	strokeWidth?: number;
	onAnimationComplete?: () => void;
	capture?: boolean;
};

export type Greeting = (typeof GREETINGS)[number];

export type GreetingId = (typeof GREETINGS_CONFIG)[number]['id'];

export interface Labels {
	svg: string;
	png: string;
	all: string;
}

export interface FileType {
	type: 'svg' | 'png';
	Icon: typeof FileSvgIcon | typeof FilePngIcon;
	getLabel: (labels: Labels) => string;
}
