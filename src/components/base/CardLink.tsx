import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Lien de titre dont la zone cliquable couvre toute sa carte.
 *
 * Envelopper la carte dans une ancre ne laissait que deux mauvais choix. Sans
 * `aria-label`, le lien se nomme par TOUT son contenu : un lecteur d'écran
 * récite la description, la date et le nombre de mots avant de dire « lien ».
 * Avec un `aria-label` réduit au titre, le nom ne contient plus le texte
 * affiché, et qui dicte ce qu'il lit sur la carte n'active rien (WCAG 2.5.3).
 * Ici le lien n'enveloppe que le titre — son nom EST son texte — et un
 * pseudo-élément étend le clic à la carte.
 *
 * Ce que la carte doit tenir en retour :
 * - elle porte `relative`, et aucun ancêtre positionné ne s'intercale entre
 *   elle et le lien. `screen-line-before` en pose un : sur une rangée
 *   intérieure, le calque s'arrêterait à cette rangée ;
 * - ses images sont décoratives (`alt=""`) : hors du lien, un `alt` égal au
 *   titre ferait annoncer le titre deux fois.
 *
 * `after:z-1` n'est pas décoratif : un descendant positionné placé APRÈS le
 * lien dans le document (pastille « nouveau », rangée de badges à filet) se
 * peint au-dessus d'un calque sans z-index et lui prend le clic.
 *
 * L'anneau de focus est dessiné sur le calque, pas sur le lien : il entoure la
 * carte, comme lorsque la carte entière était l'ancre. Sa couleur vient de la
 * règle de base de `globals.css`, celle de tous les autres liens du site.
 */
export const CardLink = ({
  className,
  ...props
}: ComponentProps<typeof Link>) => (
  <Link
    className={cn(
      "outline-none after:absolute after:inset-0 after:z-1",
      "focus-visible:after:outline-2",
      className
    )}
    {...props}
  />
);
