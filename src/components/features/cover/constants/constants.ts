import { FilePngIcon, FileSvgIcon } from '@phosphor-icons/react';
import type { TargetAndTransition } from 'motion/react';
import { BonjourEffect } from '../effects/Bonjour';
import { HelloEffect } from '../effects/Hello';
import { HolaEffect } from '../effects/Hola';
import { EnglishFlag } from '../icons/EnglishFlag';
import { FrenchFlag } from '../icons/FrenchFlag';
import { SpanishFlag } from '../icons/SpanishFlag';
import type { FileType, Labels } from '../types/types';

export const initialProps: TargetAndTransition = {
	pathLength: 0,
	opacity: 0,
};

export const animateProps: TargetAndTransition = {
	pathLength: 1,
	opacity: 1,
};

export const GREETINGS = ['bonjour', 'hello', 'hola'] as const;

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
		label: {
			svg: 'Télécharger au format .svg',
			png: 'Télécharger au format .png',
			all: 'Télécharger les effets',
		},
	},
	{
		id: 'english',
		flag: EnglishFlag,
		asset: 'hello',
		label: {
			svg: 'Download as .svg',
			png: 'Download as .png',
			all: 'Download all effects',
		},
	},
	{
		id: 'spanish',
		flag: SpanishFlag,
		asset: 'hola',
		label: {
			svg: 'Descargar como .svg',
			png: 'Descargar como .png',
			all: 'Descargar los efectos',
		},
	},
] as const;

export const GREETINGS_FILE_TYPES: FileType[] = [
	{ type: 'svg', Icon: FileSvgIcon, getLabel: (l: Labels) => l.svg },
	{ type: 'png', Icon: FilePngIcon, getLabel: (l: Labels) => l.png },
] as const;

export const variants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 20 : -20,
		opacity: 0,
		filter: 'blur(4px)',
	}),
	center: {
		x: 0,
		opacity: 1,
		filter: 'blur(0px)',
	},
	exit: (direction: number) => ({
		x: direction > 0 ? -20 : 20,
		opacity: 0,
		filter: 'blur(4px)',
	}),
};
