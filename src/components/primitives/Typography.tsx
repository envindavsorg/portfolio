import { useRender } from "@base-ui/react/use-render";
import type React from "react";
import type { ReactElement } from "react";

import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

const PROSE_CLASSNAME = cn(
  "prose prose-sm prose-zinc dark:prose-invert max-w-none",
  // headings
  "prose-headings:text-balance prose-headings:font-pixel-square prose-headings:font-semibold prose-headings:text-foreground",
  "prose-h1:mt-10 prose-h1:mb-4 prose-h1:text-xl",
  "prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-lg",
  "prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-base",
  "prose-h4:mt-5 prose-h4:mb-2 prose-h4:text-sm",
  // body text
  "prose-p:my-3 prose-p:leading-relaxed",
  "prose-lead:text-base prose-lead:text-muted-foreground",
  // lists
  "prose-li:my-1 prose-ol:my-3 prose-ul:my-3",
  // blockquote
  "prose-blockquote:my-4 prose-blockquote:border-theme prose-blockquote:font-normal prose-blockquote:not-italic",
  // links
  "prose-a:wrap-break-word prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:underline-offset-4",
  // inline code
  "prose-code:rounded-md prose-code:border prose-code:bg-muted/50 prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-normal prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
  // strong & emphasis
  "prose-strong:font-semibold prose-strong:text-foreground",
  // images
  "prose-img:my-4 prose-img:rounded-lg",
  // hr
  "prose-hr:my-8 prose-hr:border-edge"
);

export const Prose = ({
  className,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) => {
  // `useRender` must run unconditionally to respect the rules of hooks;
  // `enabled` short-circuits it to `null` when we render a plain <div>.
  const rendered = useRender({
    enabled: asChild,
    props: {
      className: cn(PROSE_CLASSNAME, className),
      "data-slot": "prose",
      ...props,
    },
    render: children as ReactElement,
  });

  if (asChild) {
    return rendered;
  }

  return (
    <div
      className={cn(PROSE_CLASSNAME, className)}
      data-slot="prose"
      {...props}
    >
      {children}
    </div>
  );
};

export const Code = ({
  className,
  ...props
}: React.ComponentProps<"code">) => {
  const isCodeBlock = "data-language" in props;

  return (
    <code
      className={cn(
        !isCodeBlock &&
          "not-prose rounded-md border bg-muted/50 px-[0.3rem] py-[0.2rem] text-sm",
        className
      )}
      data-slot={isCodeBlock ? "code-block" : "code-inline"}
      {...props}
    />
  );
};

type HeadingTypes = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingProps<T extends HeadingTypes> =
  React.ComponentProps<T> & {
    as?: T;
  };

export const Heading = <T extends HeadingTypes = "h1">({
  as,
  className,
  ...props
}: HeadingProps<T>): React.ReactElement => {
  const Comp = as ?? "h1";

  if (!props.id) {
    return <Comp className={className} {...props} />;
  }

  /**
   * Une ancre cliquable, quand le titre porte un identifiant.
   *
   * Les deux branches de ce composant rendaient exactement le même élément : le
   * `if (!props.id)` était du code mort, vestige d'une ancre jamais écrite.
   * Pourtant `rehypeSlug` est câblé depuis le début et le sommaire prouve que
   * les identifiants résolvent — partager une section demandait donc d'ouvrir
   * les outils de développement pour aller lire l'id à la main.
   *
   * Trois contraintes tenues :
   * - l'`id` reste sur l'élément de TITRE et non sur l'ancre : `useActiveItem`
   *   fait un `querySelector("[id=…]")`, et le déplacer casserait le suivi de
   *   section pendant le défilement ;
   * - le lien porte un nom accessible explicite plutôt qu'un « # » nu, qu'un
   *   lecteur d'écran énoncerait « lien dièse » ;
   * - il n'apparaît qu'au survol ou au focus, mais reste dans le flux — le faire
   *   surgir en `absolute` décalerait le titre au premier survol.
   */
  const anchor = `#${props.id}`;
  const title =
    typeof props.children === "string" ? props.children : anchor;

  return (
    <Comp className={cn("group/heading", className)} {...props}>
      {props.children}{" "}
      <a
        aria-label={m.writings_heading_anchor({ title })}
        className="ms-1 align-middle text-base text-muted-foreground no-underline opacity-0 transition-opacity focus-visible:opacity-100 group-hover/heading:opacity-100"
        href={anchor}
      >
        #
      </a>
    </Comp>
  );
};
