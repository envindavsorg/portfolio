"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import type { Content } from "@/lib/content";
import { localizeHref } from "@/paraglide/runtime";

interface WritingsShortcutsProps {
  basePath: string;
  previous: Content | null;
  next: Content | null;
}

export const WritingsShortcuts = ({
  basePath,
  previous,
  next,
}: WritingsShortcutsProps) => {
  const router = useRouter();

  const navigate = useCallback(
    (post: Content | null) => {
      if (post) {
        router.push(localizeHref(`${basePath}/${post.slug}`));
      }
    },
    [router, basePath]
  );

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      // un composant a déjà traité la touche — la navigation entre onglets d'un
      // `role="tablist"`, par exemple, appelle preventDefault(). Sans ce garde,
      // changer d'onglet au clavier faisait AUSSI changer de page.
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target as HTMLElement;

      const isInput =
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      if (isInput) {
        return;
      }

      event.preventDefault();

      if (event.key === "ArrowRight") {
        navigate(next);
      } else {
        navigate(previous);
      }
    };

    document.addEventListener("keydown", handleKeyDown, { signal });

    return () => abortController.abort();
  }, [navigate, next, previous]);

  return null;
};
