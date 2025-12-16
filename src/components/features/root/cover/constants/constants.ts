import type { motion, TargetAndTransition } from 'motion/react';
import type { ComponentProps } from 'react';
import { BonjourEffect } from '../effects/Bonjour';
import { HelloEffect } from '../effects/Hello';
import { HolaEffect } from '../effects/Hola';
import { EnglishFlag } from '../icons/EnglishFlag';
import { FrenchFlag } from '../icons/FrenchFlag';
import { SpanishFlag } from '../icons/SpanishFlag';

export const initialProps: TargetAndTransition = {
	pathLength: 0,
	opacity: 0,
};

export const animateProps: TargetAndTransition = {
	pathLength: 1,
	opacity: 1,
};

export type EffectProps = ComponentProps<typeof motion.svg> & {
	speed?: number;
	strokeWidth?: number;
	onAnimationComplete?: () => void;
	capture?: boolean;
};

export const GREETINGS = ['bonjour', 'hello', 'hola'] as const;
export type Greeting = (typeof GREETINGS)[number];

export const GREETINGS_MAP = {
	bonjour: {
		Component: BonjourEffect,
		className: 'h-20 sm:h-30',
	},
	hello: {
		Component: HelloEffect,
		className: 'h-15 sm:h-22',
	},
	hola: {
		Component: HolaEffect,
		className: 'h-15 sm:h-22',
	},
} as const;

export const GREETINGS_CONFIG = [
	{
		id: 'french',
		flag: FrenchFlag,
		asset: 'bonjour',
		label: 'Bonjour',
	},
	{
		id: 'english',
		flag: EnglishFlag,
		asset: 'hello',
		label: 'Hello',
	},
	{
		id: 'spanish',
		flag: SpanishFlag,
		asset: 'hola',
		label: 'Hola',
	},
] as const;

export const GREETINGS_FADE_DELAY: number = 2000;
