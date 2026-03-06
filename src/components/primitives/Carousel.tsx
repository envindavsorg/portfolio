'use client';

import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from 'embla-carousel-react';
import {
	type ComponentProps,
	createContext,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEvent,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { cn } from '@/lib/utils';
import { DotPattern } from '../blocks/DotPattern';
import { ArrowLeft } from '../motion/ArrowLeft';
import { ArrowRightIcon } from '../motion/ArrowRight';
import { Button } from './Button';

export type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: 'horizontal' | 'vertical';
	setApi?: (api: CarouselApi) => void;
}

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

export const useCarousel = () => {
	const context = useContext(CarouselContext);

	if (!context) {
		throw new Error('useCarousel must be used within a <Carousel />');
	}

	return context;
};

export const Carousel = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement> & CarouselProps
>(
	(
		{ orientation = 'horizontal', opts, setApi, plugins, children, ...props },
		ref
	) => {
		const [carouselRef, api] = useEmblaCarousel(
			{
				...opts,
				axis: orientation === 'horizontal' ? 'x' : 'y',
			},
			plugins
		);
		const [canScrollPrev, setCanScrollPrev] = useState(false);
		const [canScrollNext, setCanScrollNext] = useState(false);

		const onSelect = useCallback((api: CarouselApi) => {
			if (!api) {
				return;
			}

			setCanScrollPrev(api.canScrollPrev());
			setCanScrollNext(api.canScrollNext());
		}, []);

		const scrollPrev = useCallback(() => {
			api?.scrollPrev();
		}, [api]);

		const scrollNext = useCallback(() => {
			api?.scrollNext();
		}, [api]);

		const handleKeyDown = useCallback(
			(event: KeyboardEvent<HTMLDivElement>) => {
				if (event.key === 'ArrowLeft') {
					event.preventDefault();
					scrollPrev();
				} else if (event.key === 'ArrowRight') {
					event.preventDefault();
					scrollNext();
				}
			},
			[scrollPrev, scrollNext]
		);

		useEffect(() => {
			if (!(api && setApi)) {
				return;
			}

			setApi(api);
		}, [api, setApi]);

		useEffect(() => {
			if (!api) {
				return;
			}

			onSelect(api);
			api.on('reInit', onSelect);
			api.on('select', onSelect);

			return () => {
				api?.off('select', onSelect);
			};
		}, [api, onSelect]);

		return (
			<CarouselContext.Provider
				value={{
					carouselRef,
					api,
					opts,
					orientation:
						orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
					scrollPrev,
					scrollNext,
					canScrollPrev,
					canScrollNext,
				}}
			>
				<div
					className={cn(
						'relative flex size-full select-none flex-col items-center justify-center',
						'aspect-2/1 border-edge border-x text-foreground before:-top-px after:-bottom-px sm:aspect-3/1'
					)}
					onKeyDownCapture={handleKeyDown}
					ref={ref}
					{...props}
				>
					<DotPattern className="mask-[radial-gradient(100px_circle_at_center,white,transparent)] sm:mask-[radial-gradient(300px_circle_at_center,white,transparent)]" />
					{children}
				</div>
			</CarouselContext.Provider>
		);
	}
);

export const CarouselContent = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { carouselRef, orientation } = useCarousel();

	return (
		<div className="overflow-hidden" ref={carouselRef}>
			<div
				className={cn(
					'flex',
					orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
					className
				)}
				ref={ref}
				{...props}
			/>
		</div>
	);
});

export const CarouselItem = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { orientation } = useCarousel();

	return (
		<div
			className={cn(
				'flex min-w-0 shrink-0 grow-0 basis-full items-center justify-center',
				orientation === 'horizontal' ? 'pl-4' : 'pt-4',
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});

export const CarouselNext = forwardRef<
	HTMLButtonElement,
	ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
	const { scrollNext, canScrollNext } = useCarousel();

	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			className="absolute right-2 bottom-2 sm:bottom-4"
			disabled={!canScrollNext}
			onClick={scrollNext}
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			ref={ref}
			size={size}
			variant={variant}
			{...props}
		>
			<ArrowRightIcon ref={iconRef} />
			<span className="sr-only">Next slide</span>
		</Button>
	);
});

export const CarouselPrevious = forwardRef<
	HTMLButtonElement,
	ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
	const { scrollPrev, canScrollPrev } = useCarousel();

	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			className="absolute right-12 bottom-2 sm:bottom-4"
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			ref={ref}
			size={size}
			variant={variant}
			{...props}
		>
			<ArrowLeft ref={iconRef} />
			<span className="sr-only">Previous slide</span>
		</Button>
	);
});
