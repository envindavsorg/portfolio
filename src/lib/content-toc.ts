import { getTableOfContents } from "fumadocs-core/content/toc";
import type { TOCItemType } from "fumadocs-core/toc";

/**
 * Extrait le sommaire d'un contenu MDX. RÉSERVÉ AUX COMPOSANTS SERVEUR :
 * `getTableOfContents` embarque un parseur markdown complet (remark, micromark
 * et, depuis fumadocs-core 16.19, acorn), et le corps de l'article n'a pas à
 * être reparsé à l'hydratation.
 *
 * Ne rien ajouter ici qu'un composant client pourrait vouloir importer : c'est
 * ce voisinage qui avait fait fuir le parseur dans le bundle (voir `toc.ts`).
 */
export const getContentToc = (content: string): TOCItemType[] =>
  getTableOfContents(content);
