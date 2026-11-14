import { useCallback, useEffect, useRef, useState } from "react";

import { Bonjour } from "@/app/(fr)/(content)/(root)/_components/cover/effects/Bonjour";
import { Hello } from "@/app/(fr)/(content)/(root)/_components/cover/effects/Hello";
import { Hola } from "@/app/(fr)/(content)/(root)/_components/cover/effects/Hola";
import { canStep, stepIndex } from "@/lib/cycle";

const DELAY_AFTER_ANIMATION = 1000;
const GREETINGS_CONTENT = [
  { Component: Bonjour, key: "bonjour" },
  { Component: Hello, key: "hello" },
  { Component: Hola, key: "hola" },
] as const;
const GREETINGS_COUNT = GREETINGS_CONTENT.length;

/**
 * Enchaîne les trois salutations — tant que quelqu'un les regarde.
 *
 * La boucle ne s'arrêtait jamais : couverture défilée hors de l'écran ou onglet
 * en arrière-plan, elle redessinait une écriture toutes les cinq secondes. Le
 * pas suivant n'est donc lancé que si la couverture est à l'écran ; sinon il est
 * RETENU, et repart au retour. La salutation en cours reste dessinée, Motion
 * n'a plus rien à animer.
 *
 * `autoPlay` à `false` coupe l'enchaînement sans toucher à `loop` : sous
 * mouvement réduit, les boutons précédent / suivant doivent continuer de
 * tourner en rond.
 *
 * Un indice dans un état, et rien d'autre. Un carrousel (embla) tenait ce rôle
 * alors qu'une seule salutation est montée à la fois : rien ne glissait jamais
 * à l'écran, mais il mesurait la page pendant l'hydratation — une mise en page
 * forcée au milieu de la tâche la plus longue du chargement — et se
 * réinitialisait à chaque salutation, sa fenêtre épousant la largeur du tracé.
 */
const useGreetingsCarousel = (loop: boolean, autoPlay = true) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTransitioningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWatchedRef = useRef(true);
  const isStepPendingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const step = useCallback(
    (offset: 1 | -1) => {
      // un pas fait à la main remplace celui qui attendait, qu'il soit retenu
      // hors écran ou à moins d'une seconde de partir
      clearTimer();
      isTransitioningRef.current = false;
      isStepPendingRef.current = false;
      setCurrentIndex((index) =>
        stepIndex(index, offset, GREETINGS_COUNT, loop)
      );
    },
    [clearTimer, loop]
  );

  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  const scheduleNext = useCallback(() => {
    isTransitioningRef.current = true;
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      // la couverture a pu sortir de l'écran pendant la seconde d'attente
      if (!isWatchedRef.current) {
        isTransitioningRef.current = false;
        isStepPendingRef.current = true;
        return;
      }

      step(1);
    }, DELAY_AFTER_ANIMATION);
  }, [clearTimer, step]);

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) {
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

    const observer = new IntersectionObserver((entries) => {
      // fil principal occupé, plusieurs changements arrivent dans UN rappel :
      // seul le dernier dit où en est la couverture. Lire le premier la
      // déclarait à l'écran alors qu'elle venait d'en sortir.
      isIntersecting = entries.at(-1)?.isIntersecting ?? true;
      sync();
    });
    observer.observe(box);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [scheduleNext]);

  const handleAnimationComplete = useCallback(() => {
    if (!autoPlay || isTransitioningRef.current) {
      return;
    }

    if (!canStep(currentIndex, 1, GREETINGS_COUNT, loop)) {
      return;
    }

    if (!isWatchedRef.current) {
      isStepPendingRef.current = true;
      return;
    }

    scheduleNext();
  }, [autoPlay, currentIndex, loop, scheduleNext]);

  return {
    boxRef,
    canNext: canStep(currentIndex, 1, GREETINGS_COUNT, loop),
    canPrevious: canStep(currentIndex, -1, GREETINGS_COUNT, loop),
    greeting: GREETINGS_CONTENT[currentIndex] ?? GREETINGS_CONTENT[0],
    handleAnimationComplete,
    next,
    previous,
  };
};

export default useGreetingsCarousel;
