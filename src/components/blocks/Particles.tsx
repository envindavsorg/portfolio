'use client';

import type { ISourceOptions } from '@tsparticles/engine';
import { useTheme } from 'next-themes';
import { memo, useEffect, useMemo, useState } from 'react';

type ParticlesComponent = typeof import('@tsparticles/react').default;

let Cached: ParticlesComponent | null = null;
let init: Promise<void> | null = null;

const canRender = (): boolean => {
	if (typeof window === 'undefined') {
		return false;
	}
	const reducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;
	return !reducedMotion && (navigator.hardwareConcurrency ?? 2) > 2;
};

const buildOptions = (density: number, color: string): ISourceOptions => ({
	background: { color: { value: 'transparent' } },
	fullScreen: false,
	fpsLimit: 60,
	detectRetina: true,
	interactivity: {
		events: { onClick: { enable: true, mode: 'push' } },
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
			density: { enable: true, width: 1920, height: 1080 },
			value: density,
		},
		opacity: {
			value: { min: 0.1, max: 1 },
			animation: { enable: true, speed: 2, startValue: 'random' },
		},
		shape: { type: 'circle' },
		size: { value: { min: 0.5, max: 1 } },
	},
});

interface SparklesProps {
	density?: number;
}

export const Particles = memo(function Sparkles({
	density = 50,
}: SparklesProps) {
	const { resolvedTheme } = useTheme();
	const [ready, setReady] = useState(!!Cached);

	useEffect(() => {
		if (Cached || !canRender()) {
			return;
		}

		let active = true;
		const timer = setTimeout(async () => {
			const [{ default: P, initParticlesEngine }, { loadSlim }] =
				await Promise.all([
					import('@tsparticles/react'),
					import('@tsparticles/slim'),
				]);
			init ??= initParticlesEngine(loadSlim);
			await init;
			if (active) {
				Cached = P;
				setReady(true);
			}
		}, 1000);

		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, []);

	const options = useMemo(
		() => buildOptions(density, resolvedTheme === 'dark' ? '#fff' : '#000'),
		[density, resolvedTheme]
	);

	if (!(ready && Cached)) {
		return null;
	}

	return (
		<div className="pointer-events-none fixed inset-0 -z-10 size-full overflow-hidden">
			<Cached className="size-full" id="tsparticles" options={options} />
		</div>
	);
});
