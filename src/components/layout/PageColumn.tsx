import type { ComponentProps } from "react";

import { Divider } from "@/components/base/Divider";
import { cn } from "@/lib/utils";

/**
 * La colonne de 768 px, celle de la barre de navigation et du pied de page.
 *
 * Elle ne vivait que dans la mise en page des écrits : /projects, /experience,
 * /uses, /now, /weight et /cv, hors de ce groupe de routes, s'étalaient sur
 * 1424 px sous une barre de navigation de 768 — sans les deux filets verticaux
 * qui font la grille de plan. Un composant plutôt qu'un groupe de routes : y
 * déplacer six dossiers changeait une douzaine de chemins d'import pour le même
 * rendu.
 *
 * À l'impression la colonne se défait : le CV occupe la largeur de la feuille,
 * sans filets latéraux.
 */
export const PageColumn = ({
  children,
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn(
      "mx-auto min-h-svh border-edge border-x md:max-w-3xl",
      "print:max-w-none print:border-0",
      className
    )}
    data-slot="page-column"
    {...props}
  >
    <Divider before={false} border={false} type="half" />

    {children}
  </div>
);
