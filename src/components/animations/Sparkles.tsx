'use client';

import type { ISourceOptions } from '@tsparticles/engine';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useTheme } from 'next-themes';
import { memo, useEffect, useMemo, useState } from 'react';
import { checkPerformanceSupport, createSparkleOptions } from '@/lib/sparkles';
import { cn } from '@/lib/utils';

type SparklesProps = {
	id?: string;
	className?: string;
	density?: number;
	minSize?: number;
	maxSize?: number;
	speed?: number;
	background?: string;
	particleColor?: string;
	delayLoad?: number;
};

export const Sparkles = memo(
	({
		id = 'tsparticles',
		className,
		density = 50,
		minSize = 0.5,
		maxSize = 1,
		speed = 2,
		background = 'transparent',
		particleColor,
		delayLoad = 1000,
	}: SparklesProps) => {
		const { resolvedTheme } = useTheme();
		const [isInitialized, setIsInitialized] = useState(false);
		const [shouldRender, setShouldRender] = useState(false);

		useEffect(() => {
			const canRender = checkPerformanceSupport();
			if (!canRender) {
				return;
			}

			const timer = setTimeout(() => {
				setShouldRender(true);
			}, delayLoad);

			return () => clearTimeout(timer);
		}, [delayLoad]);

		useEffect(() => {
			if (!shouldRender) {
				return;
			}

			const initEngine = async () => {
				await initParticlesEngine(async (engine) => {
					await loadSlim(engine);
				});

				setIsInitialized(true);
			};

			initEngine();
		}, [shouldRender]);

		const color = useMemo(() => {
			if (particleColor) {
				return particleColor;
			}
			return resolvedTheme === 'dark' ? '#FFFFFF' : '#000000';
		}, [particleColor, resolvedTheme]);

		const options: ISourceOptions = useMemo(
			() =>
				createSparkleOptions({
					density,
					minSize,
					maxSize,
					speed,
					color,
					background,
				}),
			[density, minSize, maxSize, speed, color, background],
		);

		if (!(shouldRender && isInitialized)) {
			return null;
		}

		return (
			<div
				className={cn(
					'-z-10 pointer-events-none fixed inset-0 size-full overflow-hidden',
					className,
				)}
			>
				<Particles className="size-full" id={id} options={options} />
			</div>
		);
	},
);
