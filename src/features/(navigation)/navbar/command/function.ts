import { CATEGORY, COMMANDS } from "./content";
import { CommandGroupDef, CommandItemProps, CommandKind } from "./types";

export const buildKindMap = (posts: Post[]): Map<string, CommandKind> => {
  const map = new Map<string, CommandKind>();

  for (const group of COMMANDS) {
    for (const item of group.items) {
      if (item.kind) map.set(item.title, item.kind);
    }
  }

  for (const post of posts) {
    const config = CATEGORY[post.metadata?.category ?? "article"];
    if (config) map.set(post.metadata.title, config.kind);
  }

  return map;
};

export const buildPostGroups = (
  posts: Post[],
): Record<string, CommandItemProps[]> => {
  const grouped: Record<string, CommandItemProps[]> = {
    article: [],
    components: [],
    utils: [],
  };

  for (const post of posts) {
    const category = post.metadata?.category ?? "article";
    const config = CATEGORY[category];
    if (!config) continue;

    grouped[category]?.push({
      title: post.metadata.title,
      url: `/${config.route}/${post.slug}`,
      keywords: category === "article" ? undefined : [category],
      kind: config.kind,
    });
  }

  return grouped;
};

export const getFilteredGroups = (pathname: string): CommandGroupDef[] => {
  if (pathname !== "/") {
    return COMMANDS;
  }

  return COMMANDS.map((group, idx) =>
    idx === 0
      ? { ...group, items: group.items.filter((item) => item.url !== "/") }
      : group,
  );
};
