import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

interface ShowcaseSectionProps extends ComponentProps<"section"> {
  title: string;
}

/**
 * Une section des pages annexes : fiches, /uses, /now, /weight et /cv.
 *
 * L'intitulé faisait 14 px, le corps du texte qu'il coiffe : rien ne
 * distinguait « ce que j'y ai fait » de la première puce en dessous, alors que
 * /cv donnait 18 px en Geist Pixel au même rôle. Un seul composant, pour que
 * les sept pages ne dérivent plus chacune de leur côté.
 */
export const ShowcaseSection = ({
  children,
  className,
  title,
  ...props
}: ShowcaseSectionProps) => (
  <section
    className={cn("screen-line-after px-3 py-4", className)}
    {...props}
  >
    <h2 className="pb-2 font-pixel-square font-semibold text-lg lowercase">
      {title}
    </h2>

    {children}
  </section>
);
