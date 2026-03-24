"use client";

import { useEffect, useRef, useState } from "react";
import type { DependencyList } from "react";

import { logger } from "@/lib/logger";

export const useFnDelay = <T>(
  asyncFactory: (
    delay: (timeMs: number) => Promise<void>
  ) => Promise<T>,
  deps: DependencyList
) => {
  const [value, setValue] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    const delayFn = (timeMs: number): Promise<void> =>
      new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (!currentAbortController.signal.aborted) {
            resolve();
          }
        }, timeMs);

        currentAbortController.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timeoutId);
            reject(new Error("Delay aborted"));
          }
        );
      });

    const executeFactory = async () => {
      try {
        const result = await asyncFactory(delayFn);

        if (!currentAbortController.signal.aborted) {
          setValue(result);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message !== "Delay aborted"
        ) {
          logger.error("Error in useFnDelay factory:", error);
        }
      }
    };

    executeFactory();

    return () => {
      if (currentAbortController) {
        currentAbortController.abort();
      }
    };
  }, deps);

  useEffect(
    () => () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    },
    []
  );

  return value;
};

const useDelay = <T>(value: T, delayMs: number) =>
  useFnDelay(
    async (delay: (timeMs: number) => Promise<void>) => {
      if (delayMs > 0) {
        await delay(delayMs);
      }
      return value;
    },
    [value, delayMs]
  );

export default useDelay;
