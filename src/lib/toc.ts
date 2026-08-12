import { getTableOfContents } from "fumadocs-core/content/toc";
import type { TOCItemType } from "fumadocs-core/toc";

export interface TocGroup {
  parent: TOCItemType;
  children: TOCItemType[];
}

/**
 * Extrait le sommaire d'un contenu MDX. À appeler depuis un composant serveur :
 * `getTableOfContents` embarque un parseur markdown complet (remark/micromark),
 * qu'on ne veut pas dans le bundle client — et le corps de l'article n'a pas à
 * être reparsé à l'hydratation.
 */
export const getContentToc = (content: string): TOCItemType[] =>
  getTableOfContents(content);

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
