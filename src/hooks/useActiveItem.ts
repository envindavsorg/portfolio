import type { TOCItemType } from "fumadocs-core/toc";
import { useEffect, useState } from "react";

/**
 * La ligne de lecture, en pixels sous le haut de la fenêtre : un titre est
 * « franchi » quand son bord supérieur passe au-dessus. Les titres portent
 * `scroll-mt-32` — une ancre les pose à 128px —, d'où les 32px de marge : la
 * section qu'on vient de choisir dans le sommaire doit être la section active.
 */
const READING_LINE = 160;

/**
 * Repousse le bas de la zone observée au-delà de n'importe quelle page.
 *
 * C'est ce qui rend l'état de chaque titre BINAIRE — au-dessus de la ligne, ou
 * non. Avec une bande bornée (l'ancienne tenait entre 128px et 20 % de la
 * fenêtre), un titre a deux façons d'être dehors, au-dessus et en dessous, et
 * passer de l'une à l'autre d'un seul saut ne change pas `isIntersecting` :
 * l'observateur ne signale rien. Un retour en haut de page laissait donc la
 * dernière section marquée, et un saut en bas n'en marquait aucune.
 */
const BELOW_ANY_PAGE = 1_000_000;

const findHeading = (item: TOCItemType) =>
  document.querySelector<HTMLElement>(
    `[id="${item.url.replace("#", "")}"]`
  );

/**
 * L'entrée du sommaire où l'on se trouve : le dernier titre franchi, ou
 * `null` tant qu'on est au-dessus du premier — l'en-tête et l'introduction
 * n'appartiennent à aucune section.
 *
 * Aucun écouteur de défilement : l'observateur ne rappelle que les titres dont
 * l'état change, et il les rappelle tous au montage, donc une page ouverte sur
 * une ancre ou restaurée au milieu est juste d'emblée.
 */
const useActiveItem = (items: TOCItemType[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map(findHeading)
      .filter((heading) => heading !== null);

    if (headings.length === 0) {
      return;
    }

    const crossed = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.boundingClientRect.top < READING_LINE) {
            crossed.add(entry.target);
          } else {
            crossed.delete(entry.target);
          }
        }

        const current = headings.findLast((heading) =>
          crossed.has(heading)
        );

        setActiveId(current?.id ?? null);
      },
      {
        rootMargin: `-${READING_LINE}px 0px ${BELOW_ANY_PAGE}px 0px`,
        // seuil 1 : le rappel part quand le BORD SUPÉRIEUR passe la ligne, pas
        // quand le titre a fini de disparaître
        threshold: 1,
      }
    );

    for (const heading of headings) {
      observer.observe(heading);
    }

    return () => observer.disconnect();
  }, [items]);

  return activeId;
};

export default useActiveItem;
