"use client";

import type { DependencyList } from "react";
import { useEffect, useRef, useState } from "react";

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
      // relier setTimeout et un signal d'annulation à une promesse impose
      // le constructeur Promise
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
    /**
     * Les dépendances sont un PARAMÈTRE du hook, transmis tel quel.
     *
     * Biome exige un littéral de tableau pour vérifier la liste. C'est
     * impossible pour un hook générique dont tout l'intérêt est de laisser
     * l'appelant décider quand relancer sa fabrique.
     */
    // biome-ignore lint/correctness/useExhaustiveDependencies: liste transmise par l'appelant, non analysable statiquement
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
