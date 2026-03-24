import type { TOCItemType } from "fumadocs-core/toc";

export interface TocGroup {
  parent: TOCItemType;
  children: TOCItemType[];
}

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
