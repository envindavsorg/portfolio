import { type ComponentProps, forwardRef, useRef } from 'react';
import { Button } from '@/components/buttons/Button';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';
import { useCarousel } from './Carousel';

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
			<ArrowLeftIcon ref={iconRef} />
			<span className="sr-only">Previous slide</span>
		</Button>
	);
});
