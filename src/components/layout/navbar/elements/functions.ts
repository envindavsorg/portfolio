import type { SearchDoc } from "@/lib/search";
import { scoreText, searchableText } from "@/lib/search";

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

/**
 * Filtre de la palette ⌘K.
 *
 * Le filtre par défaut de cmdk ne compare que le `value` de l'élément, donc
 * uniquement le titre. On étend la correspondance au texte indexé (description,
 * tags, titres de sections, extrait) tout en gardant les titres en tête du
 * classement, et en ignorant les accents.
 *
 * Le calcul lui-même vit dans `lib/search.ts`, partagé avec la page /search :
 * deux classements différents pour la même requête seraient déroutants.
 */
export const commandFilter = (
  value: string,
  search: string,
  keywords?: string[]
): number => scoreText(value, keywords?.join(" ") ?? "", search);

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
