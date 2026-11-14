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

/**
 * Sous 360 px, le titre perd deux pixels de corps.
 *
 * `TextAnimate` rend chaque lettre dans son propre `inline-block` : un titre
 * trop long ne passe pas à la ligne entre deux mots, il se coupe AU MILIEU
 * d'un mot. Mesuré à 320 px : « outils pour développeurs » fait 282 px pour
 * 278 disponibles, et s'affichait « développeur / s ». À 22 px il en fait 259.
 * La forme collée, plus longue de ses deux ornements, descend à 18 px pour la
 * même raison (295 px à 20 px, 265 à 18).
 */
export const PanelTitle = ({
  className,
  ...props
}: ComponentProps<"h2">) => (
  <h2
    className={cn(
      "text-2xl max-[359px]:text-[1.375rem] sm:text-3xl",
      className
    )}
    data-slot="panel-title"
    {...props}
  />
);

/** `top-14`, pour le cas où le style calculé ne se laisse pas lire */
const DEFAULT_STICKY_LINE = 56;

/**
 * La barre de titre respire, collante ou non.
 *
 * Elle n'avait AUCUN remplissage vertical : 36 px de haut pour un titre de
 * 30/36 px, soit le plus gros texte de la page coincé entre la bande hachurée
 * et son filet, pendant que le texte courant juste dessous a droit à 12 px.
 */
const HEADER_PADDING = "px-3 py-1 sm:py-1.5";

/**
 * La copie SORTANTE du titre sort du flux par le CSS, sans mesure.
 *
 * Quand le titre change de forme, l'ancienne copie s'efface pendant que la
 * nouvelle entre : les deux sont montées ensemble une fraction de seconde.
 * `AnimatePresence` en `popLayout` retirait l'ancienne du flux en mesurant sa
 * boîte puis en injectant un `<style>` dans `<head>` — pour onze en-têtes
 * collants, à chaque passage de la ligne d'accroche : une mise en page forcée
 * et le style de toute la page invalidé au milieu du défilement.
 *
 * En mode `sync`, Motion garde la copie sortante DEVANT la nouvelle dans le
 * `<h2>` : tout ce qui n'est pas le dernier enfant est posé en absolu sur la
 * même boîte. Le rendu est le même — même place, même fondu —, et la barre
 * garde exactement un enfant dans le flux : elle ne s'effondre ni ne double.
 */
const TITLE_SWAP =
  "relative [&>:not(:last-child)]:absolute [&>:not(:last-child)]:inset-x-0 [&>:not(:last-child)]:top-0";

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
    const [isStuck, setIsStuck] = useState(false);

    useImperativeHandle(
      forwardedRef,
      () => internalRef.current as HTMLDivElement
    );

    const setRef = useCallback((element: HTMLDivElement | null) => {
      internalRef.current = element;
    }, []);

    useEffect(() => {
      const header = internalRef.current;

      if (!(sticky && header)) {
        return;
      }

      /**
       * Collé signifie AU-DESSUS de la ligne d'accroche, pas « hors du cadre ».
       *
       * Deux versions ont raté cette définition, chacune par un bord.
       *
       * La première posait `isStuck = !entry.isIntersecting` sur une sentinelle.
       * Or une sentinelle est hors du cadre dans DEUX cas opposés : quand on a
       * défilé au-delà — le titre est bien collé — et quand on ne l'a pas encore
       * atteinte. Tout titre sous la ligne de flottaison se croyait collé au
       * chargement, affichait sa forme « -- titre -- », puis changeait de texte
       * en entrant à l'écran : c'est ce qui laissait des bandes vides à la place
       * des intitulés.
       *
       * La seconde ajoutait `boundingClientRect.top < 0`. Mais le rappel ne part
       * qu'UNE fois, quand la sentinelle franchit la ligne — et à cet instant
       * son haut vaut 56, pas moins de 0. Au défilement normal l'état collé
       * n'arrivait donc jamais ; il n'apparaissait que sur un saut assez long
       * pour que la sentinelle soit déjà au-dessus de l'écran. Mesuré sur un
       * parcours mixte (molette lente, puis sauts) : 269 observations épinglées
       * sur 328 sans la forme collée à 1440 px, 365 sur 417 à 390 px. D'où des
       * intitulés tantôt à gauche, tantôt centrés, sans règle visible.
       *
       * Ici on observe l'en-tête LUI-MÊME, contre un cadre dont le haut passe un
       * pixel sous la ligne d'accroche : épinglé, il dépasse d'un pixel, donc
       * son ratio tombe sous 1 — et seulement à ce moment-là.
       *
       * La marge basse démesurée n'est pas une coquetterie : sans elle, un
       * en-tête sous l'écran est « non visible », comme un en-tête défilé. Un
       * saut de l'un à l'autre ne change alors rien pour l'observateur, qui ne
       * rappelle pas (20 à 25 écarts persistants mesurés). Avec elle, tout ce
       * qui est sous l'écran compte comme entièrement visible. Même parcours
       * après correctif : 0 titre épinglé sans sa forme collée, sur 104
       * observations à 1440 px et 105 à 390 px.
       *
       * L'accroche est LUE et non recopiée : `top-14` est en rem, donc 70 px
       * chez qui a réglé son navigateur sur 20 px — un `-57px` écrit en dur y
       * laisserait l'en-tête entièrement dans le cadre, jamais collé.
       */
      const stickyLine =
        Number.parseFloat(getComputedStyle(header).top) ||
        DEFAULT_STICKY_LINE;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsStuck(
            entry.intersectionRatio < 1 &&
              entry.boundingClientRect.top <
                (entry.rootBounds?.top ?? stickyLine + 1)
          );
        },
        {
          rootMargin: `-${stickyLine + 1}px 0px 100000px 0px`,
          threshold: 1,
        }
      );
      observer.observe(header);
      return () => observer.disconnect();
    }, [sticky]);

    if (!sticky) {
      return (
        <div
          className={cn(
            "screen-line-after",
            HEADER_PADDING,
            className
          )}
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
      <div
        className={cn(
          "screen-line-after sticky top-14 z-20 bg-background transition-colors duration-300",
          HEADER_PADDING,
          isStuck ? "text-theme" : "text-foreground",
          className
        )}
        data-slot="panel-header"
        ref={setRef}
        {...props}
      >
        {/* l'interligne de la forme collée est celui de la forme au repos : le
          corps passe de 30 à 24 px, pas la barre. Sinon elle perd 4 px à chaque
          bascule, et tout ce qui suit dans la page remonte d'autant */}
        <PanelTitle
          className={cn(
            TITLE_SWAP,
            isStuck &&
              "text-center text-xl leading-8 max-[359px]:text-lg sm:text-2xl sm:leading-9"
          )}
        >
          <TextAnimate
            animation="slideLeft"
            by="character"
            delay={isStuck ? 0 : 0.2}
            presenceMode="sync"
          >
            {isStuck ? `-- ${title} --` : (title ?? "")}
          </TextAnimate>
        </PanelTitle>
      </div>
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
