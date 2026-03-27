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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
        } else {
          clearInterval(timer);
          setDisplayValue(0);
        }
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
