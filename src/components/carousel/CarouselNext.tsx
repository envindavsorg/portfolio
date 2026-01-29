import { type ComponentProps, forwardRef, useRef } from "react";
import { Button } from "@/components/buttons/Button";
import { useCarousel } from "@/components/carousel/Carousel";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

export const CarouselNext = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
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
