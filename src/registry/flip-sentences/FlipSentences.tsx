"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface FlipSentencesProps {
  className?: string;
  sentences: string[];
  interval?: number;
  disableAnimation?: boolean;
}

const sentenceVariants = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  initial: { opacity: 0, y: 10 },
} as const;

const sentenceTransition = {
  duration: 0.25,
  ease: "easeOut",
} as const;

export const FlipSentences = ({
  className,
  sentences,
  interval = 4000,
  disableAnimation = false,
}: FlipSentencesProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sentenceCount = sentences.length;

  const longestSentence = useMemo(() => {
    let longest = "";
    for (const sentence of sentences) {
      if (sentence.length > longest.length) {
        longest = sentence;
      }
    }
    return longest;
  }, [sentences]);

  useEffect(() => {
    if (disableAnimation) {
      setCurrentIndex(0);
      return;
    }

    const advance = () =>
      setCurrentIndex((prev) => (prev + 1) % sentenceCount);

    let timer: ReturnType<typeof setInterval> | undefined;
    let isOnScreen = true;
    let isFlipHeld = false;

    const isWatched = () => isOnScreen && !document.hidden;

    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };

    // Une bascule qui arrive à échéance sans personne pour la voir est
    // RETENUE, et le minuteur s'arrête : hors de l'écran, la phrase changeait
    // toutes les quatre secondes pour rien. À l'écran, le rythme est intact.
    const start = () => {
      stop();
      timer = setInterval(() => {
        if (isWatched()) {
          advance();
          return;
        }

        isFlipHeld = true;
        stop();
      }, interval);
    };

    // au retour, la bascule retenue part tout de suite et le rythme reprend
    const resume = () => {
      if (isFlipHeld && isWatched()) {
        isFlipHeld = false;
        advance();
        start();
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
        isFlipHeld = true;
        return;
      }

      resume();
    };

    const observer = new IntersectionObserver((entries) => {
      // plusieurs changements peuvent arriver dans un seul rappel : seul le
      // dernier dit où en est le composant
      isOnScreen = entries.at(-1)?.isIntersecting ?? true;
      resume();
    });

    if (rootRef.current) {
      observer.observe(rootRef.current);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [sentenceCount, interval, disableAnimation]);

  if (disableAnimation) {
    return (
      <p
        className={cn(
          "font-medium text-theme text-xs sm:text-sm",
          className
        )}
      >
        {sentences[0]}
      </p>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      ref={rootRef}
    >
      <AnimatePresence mode="wait">
        <motion.p
          animate="animate"
          className="font-medium text-theme text-xs sm:text-sm"
          exit="exit"
          initial="initial"
          key={currentIndex}
          transition={sentenceTransition}
          variants={sentenceVariants}
        >
          {sentences[currentIndex]}
        </motion.p>
      </AnimatePresence>

      <span aria-hidden="true" className="invisible block h-0">
        {longestSentence}
      </span>
    </div>
  );
};
