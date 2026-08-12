import type { BreadcrumbList, WithContext } from "schema-dts";

import { BASE_URL } from "./metadata";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

/**
 * Le fil d'Ariane, à partir des mêmes éléments que ceux rendus à l'écran.
 *
 * Module à part, et non dans `json-ld.ts` : le fil d'Ariane est émis depuis un
 * composant CLIENT, et `json-ld.ts` importe `CERTS` — donc les quatre
 * certifications et leurs icônes SVG partiraient dans le bundle du navigateur
 * pour construire cinq lignes de balisage.
 *
 * `WritingsBreadcrumb` reçoit déjà son tableau `items` : reconstruire la liste à
 * la main dans chacune des neuf pages qui l'affichent garantirait qu'un jour
 * l'une des deux versions dérive de l'autre.
 */
export const getBreadcrumbJsonLd = (
  items: BreadcrumbEntry[]
): WithContext<BreadcrumbList> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    name: item.label,
    position: index + 1,
    // le dernier élément est la page courante : schema.org attend qu'il n'ait
    // pas d'`item`, sans quoi la page se déclare comme un lien vers elle-même
    ...(item.href && { item: `${BASE_URL}${item.href}` }),
  })),
});
