"use client";

import type { TOCItemType } from "fumadocs-core/toc";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Collapsible } from "@/components/base/Collapsible";
import {
  CollapsibleChevronsIcon,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleWithContext,
  useCollapsible,
} from "@/components/base/Collapsible";
import { GalleryHorizontalEnd } from "@/components/motion/GalleryHorizontalEnd";
import useActiveItem from "@/hooks/useActiveItem";
import type { TocGroup } from "@/lib/toc";
import { groupTocItems } from "@/lib/toc";
import { cn } from "@/lib/utils";
import * as m from "@/paraglide/messages";

interface ConnectorProps {
  direction: "up" | "down";
}

const Connector = ({ direction }: ConnectorProps) => (
  <div
    className={cn(
      "h-3 w-4 border-input border-b",
      direction === "down"
        ? "rounded-bl-xl border-l"
        : "rounded-br-xl border-r"
    )}
  />
);

interface ItemProps {
  item: TOCItemType;
  isActive: boolean;
  onNavigate?: () => void;
}

const Item = ({ item, isActive, onNavigate }: ItemProps) => (
  <div
    className={cn(
      "border-l py-1.5 transition-colors",
      isActive ? "border-theme" : "border-input"
    )}
  >
    <Link
      aria-current={isActive ? "location" : undefined}
      className={cn(
        "block pl-3 text-sm lowercase underline-offset-4 transition-colors",
        isActive ? "font-medium text-theme" : "text-foreground/60",
        "hover:text-theme hover:underline"
      )}
      href={item.url}
      onClick={onNavigate}
    >
      {item.title}
    </Link>
  </div>
);

interface OutlineProps {
  groups: TocGroup[];
  activeUrl: string | null;
  onNavigate?: () => void;
}

/** L'arbre du sommaire, commun au panneau dépliable et au rail. */
const Outline = ({ groups, activeUrl, onNavigate }: OutlineProps) =>
  groups.map((group, groupIndex) => {
    const hasChildren = group.children.length > 0;
    const isLastGroup = groupIndex === groups.length - 1;

    return (
      <div key={group.parent.url}>
        <Item
          isActive={group.parent.url === activeUrl}
          item={group.parent}
          onNavigate={onNavigate}
        />

        {hasChildren && (
          <>
            <Connector direction="down" />

            <div className="ml-[15.5px]">
              {group.children.map((child) => (
                <Item
                  isActive={child.url === activeUrl}
                  item={child}
                  key={child.url}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {!isLastGroup && <Connector direction="up" />}
          </>
        )}
      </div>
    );
  });

type ContentProps = Omit<OutlineProps, "onNavigate">;

const Content = ({ groups, activeUrl }: ContentProps) => {
  const { setOpen } = useCollapsible();

  const handleNavigate = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <div data-print="hide" className="flex flex-col px-3 pt-1 pb-3">
      <Outline
        activeUrl={activeUrl}
        groups={groups}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

/** `top-24` de l'ancre : la hauteur où le rail se colle, sous la barre de nav */
const RAIL_STICKY_TOP = 96;

/**
 * Le sommaire permanent, dans la marge droite des grands écrans.
 *
 * Le repérage de la section en cours existait déjà, mais dans un panneau que
 * chaque clic refermait : on ne le voyait jamais en lisant. La colonne fait
 * 768px, donc à partir de `xl` il reste 256px de marge vide de chaque côté.
 *
 * Aucun `fixed` : une ancre `sticky` de hauteur nulle reste à sa place dans le
 * flux, et le rail y est accroché en `absolute`. Il démarre donc à la hauteur
 * du corps de l'article — pas sur les lignes de l'en-tête — et repart avec la
 * fin de la colonne, sans JavaScript ni mesure.
 *
 * `max-h` laisse 5rem sous le rail : le bouton de retour en haut occupe ce coin.
 */
const Rail = ({ groups, activeUrl }: ContentProps) => {
  const navRef = useRef<HTMLElement>(null);
  const [isPastBody, setIsPastBody] = useState(false);

  /**
   * Le rail s'efface une fois le corps de l'article passé.
   *
   * L'ancre `sticky` est bornée par la colonne, qui contient aussi les blocs
   * de fin et le pied de page : sans cela le sommaire restait affiché à côté
   * du pied de page, et chaque ligne horizontale de ces blocs — elles
   * traversent tout l'écran — lui passait au travers.
   *
   * La bande d'observation commence au bas du rail : il disparaît au moment
   * où la fin du corps remonte au-dessus de lui, donc avant qu'une ligne ne
   * l'atteigne, et pas plus tôt.
   */
  useEffect(() => {
    const nav = navRef.current;
    const body = document.querySelector("[data-longform]");

    if (!(nav && body)) {
      return;
    }

    const offset = RAIL_STICKY_TOP + nav.offsetTop + nav.offsetHeight;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // `top < 0` : seulement quand le corps est AU-DESSUS, jamais parce
        // qu'il n'est pas encore entré dans une fenêtre très basse
        setIsPastBody(
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        );
      },
      { rootMargin: `-${offset}px 0px 0px 0px` }
    );

    observer.observe(body);

    return () => observer.disconnect();
  }, []);

  /**
   * Garde l'entrée active visible quand le sommaire dépasse la hauteur du rail.
   *
   * Par `scrollTop` et non `scrollIntoView` : ce dernier fait aussi défiler la
   * PAGE dès que le rail n'est pas entièrement à l'écran, donc sous les doigts
   * de quelqu'un qui est justement en train de lire.
   */
  useEffect(() => {
    const nav = navRef.current;

    if (!nav) {
      return;
    }

    const active = activeUrl
      ? nav.querySelector<HTMLElement>("[aria-current]")
      : null;

    if (!active) {
      // remonté au-dessus du premier titre : un long sommaire repart du début
      nav.scrollTop = 0;
      return;
    }

    const top = active.offsetTop;
    const bottom = top + active.offsetHeight;

    if (top < nav.scrollTop) {
      nav.scrollTop = top;
    } else if (bottom > nav.scrollTop + nav.clientHeight) {
      nav.scrollTop = bottom - nav.clientHeight;
    }
  }, [activeUrl]);

  return (
    <div
      className="sticky top-24 hidden h-0 xl:block"
      data-print="hide"
    >
      <nav
        aria-label={m.writings_toc_trigger_label()}
        className={cn(
          "absolute top-3 left-full ml-4 flex w-52 flex-col",
          "max-h-[calc(100svh-11rem)] overflow-y-auto [scrollbar-width:thin]",
          "transition-[opacity,visibility] duration-200 motion-reduce:transition-none",
          isPastBody && "invisible opacity-0"
        )}
        ref={navRef}
      >
        <Outline activeUrl={activeUrl} groups={groups} />
      </nav>
    </div>
  );
};

type WritingsToCProps = ComponentProps<typeof Collapsible> & {
  /** sommaire calculé côté serveur (voir getContentToc) */
  items: TOCItemType[];
};

export const WritingsToC = ({
  items,
  ...props
}: WritingsToCProps) => {
  const iconGalleryRef = useRef<AnimatedIconHandle>(null);
  const iconChevronRef = useRef<AnimatedIconHandle>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const activeId = useActiveItem(items);

  const startAnimations = useCallback(() => {
    iconGalleryRef.current?.startAnimation();
    iconChevronRef.current?.startAnimation();
  }, []);

  const stopAnimations = useCallback(() => {
    iconGalleryRef.current?.stopAnimation();
    iconChevronRef.current?.stopAnimation();
  }, []);

  const handleTriggerClick = useCallback(() => {
    startAnimations();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(stopAnimations, 600);
  }, [startAnimations, stopAnimations]);

  const groups = groupTocItems(items);
  const activeUrl = activeId ? `#${activeId}` : null;

  // un contenu sans titre de section (ex. /utils/color-generator) affichait un
  // panneau dépliable définitivement vide
  if (groups.length === 0) {
    return null;
  }

  return (
    <>
      {/* un seul sommaire par largeur : le panneau sous `xl`, le rail au-delà */}
      <div className="xl:hidden">
        <CollapsibleWithContext {...props}>
          <CollapsibleTrigger
            className={cn(
              "flex w-full cursor-pointer items-center gap-x-3",
              "p-3 [&_svg]:size-4",
              "data-[state=open]:text-theme [&_svg]:text-current",
              "[&>*:last-child]:ms-auto [&_p]:text-sm [&_p]:sm:text-base"
            )}
            onClick={handleTriggerClick}
            onMouseEnter={startAnimations}
            onMouseLeave={stopAnimations}
          >
            <GalleryHorizontalEnd ref={iconGalleryRef} />
            <p>{m.writings_toc_trigger_label()}</p>
            <CollapsibleChevronsIcon ref={iconChevronRef} />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <Content activeUrl={activeUrl} groups={groups} />
          </CollapsibleContent>
        </CollapsibleWithContext>
      </div>

      <Rail activeUrl={activeUrl} groups={groups} />
    </>
  );
};
