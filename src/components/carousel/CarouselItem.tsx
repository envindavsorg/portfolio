import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useCarousel } from './Carousel';

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
