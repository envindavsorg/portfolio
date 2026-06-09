"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";

import { soundManager } from "@/lib/sound-manager";
import { m } from "@/paraglide/messages";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const CELEBRATION_MS = 8000;

export const KonamiConfetti = () => {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    let progress = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.isContentEditable ||
        target.matches("input, textarea, select")
      ) {
        return;
      }

      const key =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === KONAMI_SEQUENCE[progress]) {
        progress += 1;
      } else {
        progress = key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }

      if (progress === KONAMI_SEQUENCE.length) {
        progress = 0;
        setCelebrating(true);
        soundManager.playToastSound();
        toast.success("", {
          description: m.easter_egg_toast(),
          duration: 5000,
          id: "konami",
        });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!celebrating) {
      return;
    }

    const timeout = setTimeout(
      () => setCelebrating(false),
      CELEBRATION_MS
    );
    return () => clearTimeout(timeout);
  }, [celebrating]);

  if (!celebrating) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <Confetti
        className="size-full"
        gravity={0.15}
        numberOfPieces={300}
        recycle={false}
      />
    </div>
  );
};
