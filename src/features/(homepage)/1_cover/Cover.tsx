"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Carousel, type CarouselApi } from "@/components/carousel/Carousel";
import { CarouselContent } from "@/components/carousel/CarouselContent";
import { CarouselItem } from "@/components/carousel/CarouselItem";
import { CarouselNext } from "@/components/carousel/CarouselNext";
import { CarouselPrevious } from "@/components/carousel/CarouselPrevious";
import { Bonjour } from "./effects/Bonjour";
import { Hello } from "./effects/Hello";
import { Hola } from "./effects/Hola";

const GREETINGS = [
  { key: "bonjour", Component: Bonjour },
  { key: "hello", Component: Hello },
  { key: "hola", Component: Hola },
] as const;

const DELAY_AFTER_ANIMATION = 1000;

interface CoverProps {
  loop?: boolean;
}

export const Cover = ({ loop = true }: CoverProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTransitioningRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentIndex(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
      isTransitioningRef.current = false;
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
      clearTimer();
    };
  }, [api, clearTimer]);

  const handleAnimationComplete = useCallback(() => {
    if (!api || isTransitioningRef.current) {
      return;
    }

    const current = api.selectedScrollSnap();
    if (!loop && current === GREETINGS.length - 1) {
      return;
    }

    isTransitioningRef.current = true;
    clearTimer();
    timerRef.current = setTimeout(
      () => api.scrollNext(),
      DELAY_AFTER_ANIMATION,
    );
  }, [api, loop, clearTimer]);

  return (
    <Carousel opts={{ loop, watchDrag: false }} setApi={setApi}>
      <CarouselContent>
        {GREETINGS.map(({ key, Component }, idx) => (
          <CarouselItem key={key}>
            {idx === currentIndex && (
              <Component
                capture={process.env.ENV_TYPE === "capture"}
                onAnimationComplete={handleAnimationComplete}
              />
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
