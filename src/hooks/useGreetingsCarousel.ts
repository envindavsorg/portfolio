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

/**
 * Enchaîne les trois salutations — tant que quelqu'un les regarde.
 *
 * La boucle ne s'arrêtait jamais : couverture défilée hors de l'écran ou onglet
 * en arrière-plan, elle redessinait une écriture toutes les cinq secondes. Le
 * pas suivant n'est donc lancé que si la couverture est à l'écran ; sinon il est
 * RETENU, et repart au retour. La salutation en cours reste dessinée, Motion
 * n'a plus rien à animer.
 *
 * `autoPlay` à `false` coupe l'enchaînement sans toucher à `loop`, qui est
 * l'option d'embla : sous mouvement réduit, les boutons précédent / suivant
 * doivent continuer de tourner en rond.
 */
const useGreetingsCarousel = (loop: boolean, autoPlay = true) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTransitioningRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isWatchedRef = useRef(true);
  const isStepPendingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    if (!api) {
      return;
    }

    isTransitioningRef.current = true;
    clearTimer();
    timerRef.current = setTimeout(() => {
      // la couverture a pu sortir de l'écran pendant la seconde d'attente
      if (!isWatchedRef.current) {
        isTransitioningRef.current = false;
        isStepPendingRef.current = true;
        return;
      }

      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        isTransitioningRef.current = false;
      }
    }, DELAY_AFTER_ANIMATION);
  }, [api, clearTimer]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentIndex(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
      isTransitioningRef.current = false;
      // un pas fait à la main remplace celui qui attendait
      isStepPendingRef.current = false;
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
      clearTimer();
    };
  }, [api, clearTimer]);

  useEffect(() => {
    if (!api) {
      return;
    }

    let isIntersecting = true;

    const sync = () => {
      isWatchedRef.current = isIntersecting && !document.hidden;
      if (isWatchedRef.current && isStepPendingRef.current) {
        isStepPendingRef.current = false;
        scheduleNext();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry?.isIntersecting ?? true;
      sync();
    });
    observer.observe(api.rootNode());
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [api, scheduleNext]);

  const handleAnimationComplete = useCallback(() => {
    if (!(api && autoPlay) || isTransitioningRef.current) {
      return;
    }

    const current = api.selectedScrollSnap();
    if (!loop && current === GREETINGS_COUNT - 1) {
      return;
    }

    if (!isWatchedRef.current) {
      isStepPendingRef.current = true;
      return;
    }

    scheduleNext();
  }, [api, autoPlay, loop, scheduleNext]);

  return {
    api,
    content: GREETINGS_CONTENT,
    currentIndex,
    handleAnimationComplete,
    setApi,
  };
};

export default useGreetingsCarousel;
