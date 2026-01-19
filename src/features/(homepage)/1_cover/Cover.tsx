'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Carousel, type CarouselApi } from '@/components/carousel/Carousel';
import { CarouselContent } from '@/components/carousel/CarouselContent';
import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselNext } from '@/components/carousel/CarouselNext';
import { CarouselPrevious } from '@/components/carousel/CarouselPrevious';
import { cn } from '@/lib/utils';
import { BonjourEffect } from './effects/BonjourEffect';
import { HelloEffect } from './effects/HelloEffect';
import { HolaEffect } from './effects/HolaEffect';

const GREETINGS = [
	{ key: 'bonjour', Component: BonjourEffect },
	{ key: 'hello', Component: HelloEffect },
	{ key: 'hola', Component: HolaEffect },
] as const;

const DELAY_AFTER_ANIMATION = 1000;

interface CoverProps {
	loop?: boolean;
}

export const Cover = ({ loop = true }: CoverProps) => {
	const [api, setApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [animationKey, setAnimationKey] = useState(0);
	const isTransitioningRef = useRef(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!api) {
			return;
		}

		setCurrentIndex(api.selectedScrollSnap());

		const onSelect = () => {
			setCurrentIndex(api.selectedScrollSnap());
			setAnimationKey((prev) => prev + 1);
			isTransitioningRef.current = false;
		};

		api.on('select', onSelect);
		return () => {
			api.off('select', onSelect);
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [api]);

	const handleAnimationComplete = useCallback(() => {
		if (!api || isTransitioningRef.current) {
			return;
		}
		if (!loop && currentIndex === GREETINGS.length - 1) {
			return;
		}

		isTransitioningRef.current = true;

		timerRef.current = setTimeout(() => {
			api.scrollNext();
		}, DELAY_AFTER_ANIMATION);
	}, [api, loop, currentIndex]);

	return (
		<div
			className={cn(
				'flex select-none items-center justify-center border-edge border-x text-foreground',
				'screen-line-before screen-line-after aspect-2/1 before:-top-px after:-bottom-px sm:aspect-3/1',
				'bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)]',
				'bg-black/0.75 bg-center bg-size-[10px_10px] dark:bg-white/0.75',
				'[--pattern-foreground:var(--color-zinc-950)]/5 dark:[--pattern-foreground:var(--color-white)]/5'
			)}
		>
			<Carousel
				className="relative flex size-full flex-col items-center justify-center"
				opts={{ loop, watchDrag: false }}
				orientation="horizontal"
				setApi={setApi}
			>
				<CarouselContent>
					{GREETINGS.map(({ key, Component }, idx: number) => (
						<CarouselItem
							className="flex items-center justify-center"
							key={key}
						>
							{idx === currentIndex && (
								<Component
									capture={process.env.ENV_TYPE === 'capture'}
									key={`${key}-${animationKey}`}
									onAnimationComplete={handleAnimationComplete}
								/>
							)}
						</CarouselItem>
					))}
				</CarouselContent>

				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	);
};
