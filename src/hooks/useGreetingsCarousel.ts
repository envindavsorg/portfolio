import { useCallback, useEffect, useRef, useState } from "react";

import { Bonjour } from "@/app/(fr)/(content)/(root)/_components/cover/effects/Bonjour";
import { Hello } from "@/app/(fr)/(content)/(root)/_components/cover/effects/Hello";
import { Hola } from "@/app/(fr)/(content)/(root)/_components/cover/effects/Hola";
import type { CarouselApi } from "@/components/primitives/Carousel";

const GREETINGS_COUNT = 3;
const DELAY_AFTER_ANIMATION = 1000;
const GREETINGS_CONTENT = [
  { Component: Bonjour, key: "bonjour" },
  { Component: Hello, key: "hello" },
  { Component: Hola, key: "hola" },
] as const;

const useGreetingsCarousel = (loop: boolean) => {
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
    if (!loop && current === GREETINGS_COUNT - 1) {
      return;
    }

    isTransitioningRef.current = true;
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        isTransitioningRef.current = false;
      }
    }, DELAY_AFTER_ANIMATION);
  }, [api, loop, clearTimer]);

  return {
    api,
    content: GREETINGS_CONTENT,
    currentIndex,
    handleAnimationComplete,
    setApi,
  };
};

export default useGreetingsCarousel;
