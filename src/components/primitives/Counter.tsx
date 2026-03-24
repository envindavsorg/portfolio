"use client";

import NumberFlow from "@number-flow/react";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const getStep = (value: number): number => {
  if (value >= 1000) {
    return 100;
  }
  if (value >= 100) {
    return 10;
  }
  return 1;
};

interface CounterProps {
  value: number;
  children?: React.ReactNode;
  className?: string;
}

export const Counter = memo(
  ({ value, children, className }: CounterProps) => {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval>>(null);

    useEffect(() => {
      const element = ref.current;
      if (!element) {
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const step = getStep(value);
            const totalSteps = Math.ceil(value / step);
            const interval = 600 / totalSteps;
            let current = 0;

            timerRef.current = setInterval(() => {
              current += step;
              if (current >= value) {
                setDisplayValue(value);
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
              } else {
                setDisplayValue(current);
              }
            }, interval);
          } else {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setDisplayValue(0);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      return () => {
        observer.disconnect();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [value]);

    return (
      <span
        className={cn("inline-flex items-center", className)}
        ref={ref}
      >
        <NumberFlow respectMotionPreference value={displayValue} />
        {children}
      </span>
    );
  }
);
