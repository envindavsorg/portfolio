import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * La liste à puce « -- » des pages annexes.
 *
 * Elle était écrite à la main à quatre endroits, et la puce y était un enfant
 * flexible comme un autre : sur un élément qui passe à la ligne à 390 px, elle
 * rétrécissait et se coupait ENTRE ses deux tirets, empilés l'un sur l'autre
 * (6 × 40 px mesurés, au lieu de 11 × 20).
 *
 * La liste est un bloc et non un conteneur flexible : c'est ce qui laisse un
 * appelant la passer sur deux colonnes (`sm:columns-2`), que `display: flex`
 * ignorerait.
 */
export const ShowcaseDashList = ({
  className,
  ...props
}: ComponentProps<"ul">) => (
  <ul className={cn("space-y-1.5", className)} {...props} />
);

export const ShowcaseDashItem = ({
  children,
  className,
  ...props
}: ComponentProps<"li">) => (
  <li
    className={cn(
      "flex break-inside-avoid items-baseline gap-x-2 text-sm",
      className
    )}
    {...props}
  >
    {/* décorative : l'élément de liste porte déjà la sémantique, la répéter
        à l'oral n'apprend rien. Noire à l'impression : l'accent du thème
        sombre est un pêche clair, illisible sur du papier. */}
    <span
      aria-hidden="true"
      className="shrink-0 whitespace-nowrap text-theme print:text-foreground"
    >
      --
    </span>

    <span className="min-w-0">{children}</span>
  </li>
);
