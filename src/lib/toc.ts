import type { TOCItemType } from "fumadocs-core/toc";

export interface TocGroup {
  parent: TOCItemType;
  children: TOCItemType[];
}

/**
 * Ce module ne fait QUE regrouper des entrées déjà extraites, et n'importe de
 * fumadocs qu'un type.
 *
 * `getContentToc` vivait ici, avec son import de `fumadocs-core/content/toc` en
 * tête de fichier. Or `WritingsToC` — un composant client — importe
 * `groupTocItems` depuis ce même module : le parseur markdown complet partait
 * donc dans le bundle de chaque page de contenu, alors que le commentaire d'à
 * côté disait précisément ne pas le vouloir. Un import en tête de module suit
 * tout ce qui importe le module, pas seulement la fonction qui s'en sert.
 *
 * fumadocs-core 16.19 a rendu la fuite visible : `remark-heading` y tire acorn,
 * et les pages de contenu ont pris 81 Kio de JS d'un coup. L'extraction est
 * désormais dans `content-toc.ts`, que seules les pages serveur importent.
 */
export const groupTocItems = (items: TOCItemType[]): TocGroup[] => {
  if (items.length === 0) {
    return [];
  }

  const minDepth = Math.min(...items.map((item) => item.depth));
  const groups: TocGroup[] = [];
  let currentGroup: TocGroup | null = null;

  for (const item of items) {
    if (item.depth === minDepth) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = { children: [], parent: item };
    } else if (currentGroup) {
      currentGroup.children.push(item);
    }
  }

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
};
