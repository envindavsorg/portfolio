"use client";

import NumberFlow from "@number-flow/react";
import type { ReactNode } from "react";
import { memo, useEffect, useRef, useState } from "react";

interface CounterProps {
  value: number;
  children?: ReactNode;
}

export const Counter = memo(({ value, children }: CounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    let step = 1;
    if (value >= 1000) {
      step = 100;
    } else if (value >= 100) {
      step = 10;
    }

    let timer: ReturnType<typeof setInterval>;
    const interval = 600 / Math.ceil(value / step);

    // Le DERNIER changement du lot : fil principal occupé, « hors écran »
    // puis « à l'écran » arrivent dans un même rappel. Lire le premier
    // laissait le compteur à zéro sous les yeux, jusqu'à sa prochaine sortie.
    //
    // Le décompte repart toujours de zéro, minuteur précédent arrêté : deux
    // « à l'écran » de suite deviennent possibles, et le premier minuteur,
    // arrivé au bout, aurait arrêté le second à sa place avant de tourner
    // sans fin. Au fil normal rien ne change : une entrée suit toujours une
    // sortie, donc un compteur déjà à zéro et sans minuteur.
    const observer = new IntersectionObserver(
      (entries) => {
        clearInterval(timer);
        setDisplayValue(0);

        if (!entries.at(-1)?.isIntersecting) {
          return;
        }

        let current = 0;

        timer = setInterval(() => {
          current += step;
          if (current >= value) {
            setDisplayValue(value);
            clearInterval(timer);
          } else {
            setDisplayValue(current);
          }
        }, interval);
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [value]);

  return (
    <span ref={ref} className="inline-flex items-center">
      <NumberFlow respectMotionPreference value={displayValue} />
      {children}
    </span>
  );
});
