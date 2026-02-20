'use client';

import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from 'embla-carousel-react';
import {
	createContext,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEvent,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { cn } from '@/lib/utils';
import { DotPattern } from '../elements/DotPattern';

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
