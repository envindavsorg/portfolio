"use client";

import type { ComponentProps } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { TextAnimate } from "@/components/blocks/TextAnimate";
import { cn } from "@/lib/utils";

export const Panel = ({
  className,
  ...props
}: ComponentProps<"section">) => (
  <section
    className={cn("border-edge border-x", className)}
    data-slot="panel"
    {...props}
  />
);

export const PanelTitle = ({
  className,
  ...props
}: ComponentProps<"h2">) => (
  <h2
    className={cn("text-2xl sm:text-3xl", className)}
    data-slot="panel-title"
    {...props}
  />
);

interface PanelHeaderProps extends ComponentProps<"div"> {
  sticky?: boolean;
  title?: string;
}

export const PanelHeader = forwardRef<
  HTMLDivElement,
  PanelHeaderProps
>(
  (
    { children, className, sticky, title, ...props },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [isStuck, setIsStuck] = useState(false);

    useImperativeHandle(
      forwardedRef,
      () => internalRef.current as HTMLDivElement
    );

    const setRef = useCallback((element: HTMLDivElement | null) => {
      internalRef.current = element;
    }, []);

    useEffect(() => {
      if (!(sticky && sentinelRef.current)) {
        return;
      }

      /**
       * Collé signifie AU-DESSUS du cadre, pas « hors du cadre ».
       *
       * La version précédente posait `isStuck = !entry.isIntersecting`. Or une
       * sentinelle est hors du cadre dans DEUX cas opposés : quand on a défilé
       * au-delà — le titre est bien collé — et quand on ne l'a pas encore
       * atteinte. Tout titre sous la ligne de flottaison se croyait donc collé au
       * chargement, affichait sa forme « -- titre -- », puis changeait de texte
       * en entrant à l'écran. Ce changement de contenu en pleine vie du composant
       * est ce qui laissait les titres à `opacity: 0`, c'est-à-dire des bandes
       * vides à la place des intitulés de section.
       *
       * `boundingClientRect.top < 0` lève l'ambiguïté : la sentinelle est passée
       * au-dessus du bord haut.
       */
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsStuck(
            !entry.isIntersecting && entry.boundingClientRect.top < 0
          );
        },
        { rootMargin: "-57px 0px 0px 0px", threshold: 0 }
      );
      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    }, [sticky]);

    if (!sticky) {
      return (
        <div
          className={cn("screen-line-after px-3", className)}
          data-slot="panel-header"
          ref={setRef}
          {...props}
        >
          {/* `title` était ignoré hors mode collant : un appelant qui le
            fournissait sans `sticky` obtenait un en-tête vide, donc une section
            sans intitulé — visuellement et pour un lecteur d'écran. */}
          {title ? <PanelTitle>{title}</PanelTitle> : null}
          {children}
        </div>
      );
    }

    return (
      <>
        <div
          aria-hidden="true"
          className="pointer-events-none invisible -mt-px h-px w-full"
          ref={sentinelRef}
        />
        <div
          className={cn(
            "screen-line-after sticky top-14 z-20 px-3 transition-colors duration-300",
            isStuck
              ? "bg-background text-theme"
              : "bg-background text-foreground",
            className
          )}
          data-slot="panel-header"
          ref={setRef}
          {...props}
        >
          <PanelTitle
            className={cn(
              isStuck && "text-center text-xl sm:text-2xl"
            )}
          >
            {isStuck ? (
              <TextAnimate animation="slideLeft" by="character">
                {`-- ${title} --`}
              </TextAnimate>
            ) : (
              <TextAnimate
                animation="slideLeft"
                by="character"
                delay={0.2}
              >
                {title ?? ""}
              </TextAnimate>
            )}
          </PanelTitle>
        </div>
      </>
    );
  }
);

export const PanelContent = ({
  className,
  reset = false,
  ...props
}: ComponentProps<"div"> & { reset?: boolean }) => (
  <div
    className={cn(
      reset ? "space-y-0 p-0" : "space-y-1.5 p-3",
      className
    )}
    data-slot="panel-body"
    {...props}
  />
);

export const PanelFooter = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn(
      "screen-line-before flex justify-between gap-3 px-3 py-2 max-sm:flex-col sm:justify-end",
      className
    )}
    data-slot="panel-footer"
    {...props}
  />
);
