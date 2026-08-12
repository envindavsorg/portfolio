import type { SearchDoc } from "@/lib/search";
import { normalize, searchableText } from "@/lib/search";

import { CATEGORY, COMMANDS } from "./content";
import type {
  CommandGroupDef,
  CommandItemProps,
  CommandKind,
} from "./types";

export const buildKindMap = (
  posts: SearchDoc[]
): Map<string, CommandKind> => {
  const map = new Map<string, CommandKind>();

  for (const group of COMMANDS) {
    for (const item of group.items) {
      if (item.kind) {
        map.set(item.title(), item.kind);
      }
    }
  }

  for (const post of posts) {
    const config = CATEGORY[post.category];
    if (config) {
      map.set(post.title, config.kind);
    }
  }

  return map;
};

export const buildPostGroups = (
  posts: SearchDoc[]
): Record<string, CommandItemProps[]> => {
  const grouped: Record<string, CommandItemProps[]> = {
    articles: [],
    components: [],
    utils: [],
  };

  for (const post of posts) {
    const config = CATEGORY[post.category];
    if (!config) {
      continue;
    }

    grouped[post.category]?.push({
      // le texte indexé voyage dans `keywords` : cmdk le passe au filtre, ce
      // qui rend la recherche plein texte sans changer l'affichage
      keywords: [post.category, searchableText(post)],
      kind: config.kind,
      title: () => post.title,
      url: `/${config.route}/${post.slug}`,
    });
  }

  return grouped;
};

const EXACT_TITLE_SCORE = 1;
const TITLE_MATCH_SCORE = 0.9;
const CONTENT_MATCH_SCORE = 0.5;
const NO_MATCH = 0;

/**
 * Filtre de la palette ⌘K.
 *
 * Le filtre par défaut de cmdk ne compare que le `value` de l'élément, donc
 * uniquement le titre. On étend la correspondance au texte indexé (description,
 * tags, titres de sections, extrait) tout en gardant les titres en tête du
 * classement, et en ignorant les accents.
 */
export const commandFilter = (
  value: string,
  search: string,
  keywords?: string[]
): number => {
  const query = normalize(search.trim());
  if (!query) {
    return EXACT_TITLE_SCORE;
  }

  const title = normalize(value);
  if (title === query) {
    return EXACT_TITLE_SCORE;
  }
  if (title.includes(query)) {
    return TITLE_MATCH_SCORE;
  }

  const haystack = keywords?.join(" ") ?? "";
  if (haystack && normalize(haystack).includes(query)) {
    return CONTENT_MATCH_SCORE;
  }

  return NO_MATCH;
};

export const getFilteredGroups = (
  pathname: string
): CommandGroupDef[] => {
  if (pathname !== "/") {
    return COMMANDS;
  }

  return COMMANDS.map((group, idx) =>
    idx === 0
      ? {
          ...group,
          items: group.items.filter((item) => item.url !== "/"),
        }
      : group
  );
};

export const isRouteActive = (
  href: string,
  path: string | null = ""
): boolean => {
  if (path === href) {
    return true;
  }

  if (href === "/") {
    return false;
  }

  return path?.startsWith(`${href}/`) ?? false;
};
