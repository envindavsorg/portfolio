"use client";

import type { ComponentProps } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from "react";

import type { StaggerTimeline } from "@/lib/stagger-easing";
import { staggerDuration, staggerEasing } from "@/lib/stagger-easing";
import type { TitleForm } from "@/lib/sticky-title";
import {
  INITIAL_TITLE,
  titleForm,
  titleReducer,
} from "@/lib/sticky-title";
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
 * Les lettres du titre collant : des `<span>` et des transitions CSS.
 *
 * Elles étaient onze `TextAnimate`, soit un composant Motion par lettre. Deux
 * défauts en venaient, mesurés sur l'accueil à 390 px, CPU ×4.
 *
 * Au CHARGEMENT : Motion écrit l'état de départ dans le HTML, donc chaque
 * titre arrivait à `opacity: 0` et le restait jusqu'à l'hydratation — une
 * barre vide là où l'on attend un intitulé (lisible à 2,6-2,9 s pour une
 * première peinture à 0,3 s), et pour toujours sans JavaScript.
 *
 * Au DÉFILEMENT : chaque passage d'un titre sur la ligne d'accroche démontait
 * une vingtaine de composants, en montait vingt-six, puis animait les deux
 * copies lettre à lettre — l'opacité par une animation à délai, le glissement
 * image par image en JavaScript, sur le fil principal. Ces bascules sont le
 * premier coût du défilement : les couper ramenait l'aller-retour à la molette
 * de 9,4 à 5,2 s de fil principal, et ses tâches longues de 12 à 0 ou 1.
 *
 * Le mouvement est le même : 300 ms par lettre en `easeOut`, départs étalés
 * sur 300 ms, 20 px de glissement, la copie sortante qui s'efface à rebours.
 * Ce qui change, c'est qui le porte — le compositeur, sur une ligne de temps
 * commune (`lib/stagger-easing.ts`) ; les états sont dans `lib/sticky-title.ts`.
 *
 * ⚠️ Ce qui RESTE cher dans une bascule n'est pas ici : c'est le fondu de
 * couleur de l'en-tête (`transition-colors`). La couleur est héritée, donc
 * pendant 300 ms chaque image recalcule le style de chaque lettre en train de
 * bouger. Ce fondu coupé, le même aller-retour livre 530 à 540 images au lieu
 * de 400 à 440 ; il fait partie de l'effet, donc il reste.
 */
const LETTER_MS = 300;
const SPREAD_MS = 300;

/** la forme au repos laisse 200 ms d'avance à la forme collée qui sort */
const PLAIN_DELAY_MS = 200;

/** passé ce délai plus aucune lettre sortante ne bouge : on démonte la copie */
const EXIT_MS = SPREAD_MS + LETTER_MS;

/** ordre FIXE dans le DOM : une bascule ne déplace aucun nœud */
const TITLE_FORMS: TitleForm[] = ["plain", "stuck"];

/**
 * `transition-property` est marquée `!important`, et elle seule.
 *
 * Le fournisseur de thème coupe toutes les transitions de la page le temps de
 * poser le thème (`* { transition: none !important }`), y compris au montage.
 * Sur un écran rapide ce moment tombe en pleine entrée servie : relevée à
 * 1440×900, elle s'arrêtait net à 41 % d'opacité, 170 ms après l'hydratation.
 * Une transition en cours ne s'annule que si sa propriété sort de la liste ; sa
 * durée et sa courbe ne sont lues qu'au départ, donc elles n'ont pas à être
 * protégées — et elles restent en ligne, lettre par lettre.
 *
 * La classe ne donne AUCUNE durée : sans style en ligne, un changement d'état
 * s'applique d'un coup. C'est ce qui masque une lettre sans l'animer.
 */
const LETTER =
  "inline-block whitespace-pre font-pixel-square [transition-property:opacity,translate]!";

/** le glissement est réservé à qui accepte le mouvement ; le fondu reste */
const LETTER_MASKED = "opacity-0 motion-safe:translate-x-[20px]";
const LETTER_LEAVING = "opacity-0 motion-safe:-translate-x-[20px]";

/**
 * L'entrée jouée par le CSS seul, dès la première peinture — pour le titre
 * qui peut se trouver dans le premier écran, bien avant que le JavaScript
 * n'arrive. Sans `@starting-style`, le titre est simplement là.
 */
const LETTER_SERVED_ENTRANCE =
  "starting:opacity-0 motion-safe:starting:translate-x-[20px]";

interface TitleCopyProps {
  /** montée par une bascule, donc à faire entrer */
  appear: boolean;
  form: TitleForm;
  leaving: boolean;
  masked: boolean;
  servedEntrance: boolean;
  text: string;
  /** hors de l'état servi : les lettres visibles portent leur ligne de temps */
  timed: boolean;
}

const TitleCopy = ({
  appear,
  form,
  leaving,
  masked,
  servedEntrance,
  text,
  timed,
}: TitleCopyProps) => {
  const [ready, setReady] = useState(!appear);

  /**
   * Une copie qui apparaît entre en DEUX temps : montée masquée, puis révélée.
   * Une transition part de la dernière valeur que le navigateur a calculée ;
   * révélée dans la même image que son montage, la copie n'aurait jamais eu de
   * valeur de départ et s'afficherait d'un bloc. Deux images garantissent
   * qu'un calcul de style a bien eu lieu entre les deux.
   */
  useEffect(() => {
    if (ready) {
      return;
    }

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setReady(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [ready]);

  const letters = [...text];
  const timeline: StaggerTimeline = {
    count: letters.length,
    delay: !leaving && form === "plain" ? PLAIN_DELAY_MS : 0,
    duration: LETTER_MS,
    reverse: leaving,
    spread: SPREAD_MS,
  };
  const transitionDuration = `${Math.round(staggerDuration(timeline))}ms`;
  const hidden = masked || !ready;

  return (
    <p
      // le nom du titre vient du `sr-only` : les lettres sont décoratives, et
      // une copie qui sort n'a plus rien à dire à un lecteur d'écran
      aria-hidden={leaving ? true : undefined}
      // le fondu du bloc est celui que Motion donnait par défaut à l'opacité ;
      // la copie sortante quitte le flux : la barre garde un seul enfant, elle
      // ne s'effondre ni ne double
      className={cn(
        "whitespace-pre-wrap transition-opacity duration-300 ease-[cubic-bezier(0.25,0.1,0.35,1)]",
        leaving && "absolute inset-x-0 top-0 opacity-0"
      )}
    >
      <span className="sr-only">{text}</span>
      {letters.map((letter, index) => (
        <span
          aria-hidden
          className={cn(
            LETTER,
            servedEntrance && LETTER_SERVED_ENTRANCE,
            leaving && LETTER_LEAVING,
            hidden && LETTER_MASKED
          )}
          // biome-ignore lint/suspicious/noArrayIndexKey: les lettres d'un titre ne changent ni d'ordre ni de nombre, et deux « e » n'ont que leur rang pour se distinguer
          key={index}
          style={
            timed && !hidden
              ? {
                  transitionDuration,
                  transitionTimingFunction: staggerEasing(
                    index,
                    timeline
                  ),
                }
              : undefined
          }
        >
          {letter}
        </span>
      ))}
    </p>
  );
};

interface PanelHeaderProps extends ComponentProps<"div"> {
  /**
   * Pour le titre collant qui peut tomber dans le PREMIER écran : son entrée
   * est jouée par le CSS dès la première peinture. Les autres sont servis
   * visibles et ne s'animent qu'une fois hydratés, à leur arrivée à l'écran.
   */
  eager?: boolean;
  sticky?: boolean;
  title?: string;
}

export const PanelHeader = forwardRef<
  HTMLDivElement,
  PanelHeaderProps
>(
  (
    { children, className, eager = false, sticky, title, ...props },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null);
    const [state, dispatch] = useReducer(titleReducer, INITIAL_TITLE);

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
        (entries) => {
          // Le DERNIER changement du lot : fil principal occupé, « collé »
          // puis « décollé » arrivent dans un même rappel. Lire le premier
          // laissait la forme « -- titre -- » à un en-tête revenu sous la
          // ligne d'accroche, jusqu'au prochain franchissement.
          const entry = entries.at(-1);

          if (!entry) {
            return;
          }

          dispatch({
            stuck:
              entry.intersectionRatio < 1 &&
              entry.boundingClientRect.top <
                (entry.rootBounds?.top ?? stickyLine + 1),
            type: "stick",
          });
        },
        {
          rootMargin: `-${stickyLine + 1}px 0px 100000px 0px`,
          threshold: 1,
        }
      );
      observer.observe(header);

      /**
       * L'entrée ne se joue que pour qui peut la voir.
       *
       * Le HTML servi montre tous les titres. Au premier constat, ceux qui
       * sont hors écran sont masqués — personne ne les regarde — et joueront
       * leur entrée en arrivant dans le cadre, une seule fois. Un titre déjà à
       * l'écran reste tel quel : le masquer pour le refaire entrer serait un
       * clignotement, pas une animation.
       *
       * C'est l'observateur qui tranche, pas une mesure au montage : son
       * premier rappel donne la position sans forcer de mise en page au
       * milieu de l'hydratation.
       */
      let firstReport = true;
      const entrance = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          dispatch({ type: "enter" });
          entrance.disconnect();
        } else if (firstReport) {
          dispatch({ type: "arm" });
        }

        firstReport = false;
      });
      entrance.observe(header);

      return () => {
        observer.disconnect();
        entrance.disconnect();
      };
    }, [sticky]);

    useEffect(() => {
      if (!state.exiting) {
        return;
      }

      const timer = setTimeout(
        () => dispatch({ type: "exited" }),
        EXIT_MS
      );

      return () => clearTimeout(timer);
    }, [state.exiting]);

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

    const current = titleForm(state.stuck);
    const texts: Record<TitleForm, string> = {
      plain: title ?? "",
      stuck: `-- ${title} --`,
    };
    const served = state.phase === "static";

    return (
      <div
        className={cn(
          "screen-line-after sticky top-14 z-20 bg-background transition-colors duration-300",
          HEADER_PADDING,
          state.stuck ? "text-theme" : "text-foreground",
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
            "relative",
            state.stuck &&
              "text-center text-xl leading-8 max-[359px]:text-lg sm:text-2xl sm:leading-9"
          )}
        >
          {TITLE_FORMS.filter(
            (form) => form === current || form === state.exiting
          ).map((form) => (
            <TitleCopy
              appear={!served}
              form={form}
              key={form}
              leaving={form !== current}
              masked={state.phase === "armed"}
              servedEntrance={eager && served}
              text={texts[form]}
              timed={eager || !served}
            />
          ))}
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
