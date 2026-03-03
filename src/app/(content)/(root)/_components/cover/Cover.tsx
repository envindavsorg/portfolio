'use client';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/primitives/Carousel';
import useGreetingsCarousel from '@/hooks/useGreetingsCarousel';

interface CoverProps {
	loop?: boolean;
}

export const Cover = ({ loop = true }: CoverProps) => {
	const { setApi, currentIndex, handleAnimationComplete, content } = useGreetingsCarousel(loop);

	return (
		<Carousel opts={{ loop, watchDrag: false }} setApi={setApi}>
			<CarouselContent>
				{content.map(({ key, Component }, idx) => (
					<CarouselItem key={key}>
						{idx === currentIndex && (
							<Component capture={process.env.ENV_TYPE === 'capture'} onAnimationComplete={handleAnimationComplete} />
						)}
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
};
