import type { ISourceOptions } from '@tsparticles/engine';

export type SparkleConfig = {
	density?: number;
	minSize?: number;
	maxSize?: number;
	speed?: number;
	color?: string;
	background?: string;
	reducedMotion?: boolean;
};

export const createSparkleOptions = (config: SparkleConfig): ISourceOptions => {
	const {
		density = 50,
		minSize = 0.5,
		maxSize = 1,
		speed = 2,
		color = '#FFFFFF',
		background = 'transparent',
	} = config;

	return {
		background: {
			color: { value: background },
		},
		fullScreen: false,
		fpsLimit: 60,
		interactivity: {
			events: {
				onClick: { enable: true, mode: 'push' },
				onHover: { enable: false },
			},
			modes: { push: { quantity: 2 } },
		},
		particles: {
			color: { value: color },
			move: {
				enable: true,
				direction: 'none',
				outModes: { default: 'out' },
				speed: { min: 0.1, max: 1 },
			},
			number: {
				density: {
					enable: true,
					width: 1920,
					height: 1080,
				},
				value: density,
			},
			opacity: {
				value: { min: 0.1, max: 1 },
				animation: {
					enable: true,
					speed,
					startValue: 'random',
				},
			},
			shape: { type: 'circle' },
			size: {
				value: {
					min: minSize,
					max: maxSize,
				},
			},
		},
		detectRetina: true,
	};
};

export const checkPerformanceSupport = (): boolean => {
	if (typeof window === 'undefined') {
		return false;
	}

	const reducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;
	const hardwareConcurrency = navigator.hardwareConcurrency || 2;
	const sufficientHardware = hardwareConcurrency > 2;

	return !reducedMotion && sufficientHardware;
};
