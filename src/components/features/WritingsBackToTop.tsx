"use client";

import { ArrowUpIcon } from "@phosphor-icons/react/ssr";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/primitives/Button";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

/** au-delà de deux hauteurs d'écran, remonter à la main devient pénible */
const REVEAL_AFTER_SCREENS = 2;

export const WritingsBackToTop = () => {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  useEffect(() => {
    let queued = false;
    let frame = 0;

    const measure = () => {
      queued = false;
      setVisible(
        window.scrollY > window.innerHeight * REVEAL_AFTER_SCREENS
      );
    };

    const onScroll = () => {
      if (queued) {
        return;
      }
      queued = true;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleClick = useCallback(() => {
    window.scrollTo({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      top: 0,
    });

    // sans cela la tabulation reprendrait au milieu de l'article qu'on vient
    // de quitter ; `tabIndex = -1` rend <main> focusable par programme
    // uniquement, sans l'ajouter à l'ordre de tabulation.
    const main = document.querySelector("main");
    if (main) {
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
    }
  }, [prefersReducedMotion]);

  return (
    <Button
      aria-label={m.writings_back_to_top()}
      className={cn(
        "fixed right-4 bottom-4 z-40 transition-opacity duration-200",
        // `hidden` plutôt qu'une opacité nulle : un bouton invisible mais
        // focusable est un piège au clavier
        visible
          ? "opacity-100"
          : "pointer-events-none hidden opacity-0"
      )}
      onClick={handleClick}
      size="icon"
      variant="outline"
    >
      <ArrowUpIcon className="size-4" weight="bold" />
    </Button>
  );
};
