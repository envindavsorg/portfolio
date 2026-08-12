import { slugify } from "@/lib/case";
import type { Content, ContentCategory } from "@/lib/content";

interface TagData {
  tagCounts: Record<string, number>;
  tags: string[];
}

/** un tag tel qu'exposé par une page /tags/[tag] */
export interface TagEntry {
  /** identifiant d'URL, sans accent ni ponctuation */
  slug: string;
  /** orthographe à afficher : la plus fréquente parmi les variantes */
  label: string;
  /** toutes les orthographes qui produisent ce slug */
  variants: string[];
  count: number;
  /** catégories dans lesquelles le tag apparaît, pour situer le sujet */
  categories: ContentCategory[];
}

/**
 * Transforme un tag en segment d'URL.
 *
 * Deux orthographes différentes peuvent produire le même slug (« next.js » et
 * « next js » donnent tous deux « next-js »), et c'est voulu : une page de tag
 * regroupe alors les deux, plutôt que d'en perdre une silencieusement ou de
 * servir deux URL pour le même sujet.
 *
 * Délègue à `slugify` : deux translittérations différentes dans le même codebase
 * finiraient par divergent, et les URL des sujets cesseraient de correspondre.
 */
export const slugifyTag = (tag: string): string => slugify(tag);

export const ALL_TAG = "tout";

export const isActiveTag = (tag: string, activeTag: string) =>
  tag === ALL_TAG
    ? activeTag === ALL_TAG
    : activeTag === tag.toLowerCase();

export const matchesTag = (
  tags: string[] | undefined,
  activeTag: string
) =>
  activeTag === ALL_TAG ||
  (tags ?? []).some((t) => t.toLowerCase() === activeTag);

const buildTagCounts = (
  contents: Content[]
): Record<string, number> => {
  const counts: Record<string, number> = {
    [ALL_TAG]: contents.length,
  };

  for (const { metadata } of contents) {
    for (const tag of metadata.tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }

  return counts;
};

export const getTagData = (contents: Content[]): TagData => {
  const tagCounts = buildTagCounts(contents);

  const tags = [
    ALL_TAG,
    ...Object.keys(tagCounts)
      .filter((k) => k !== ALL_TAG)
      .toSorted(),
  ];

  return { tagCounts, tags };
};

interface TagAccumulator {
  /** compte par orthographe, pour choisir le libellé le plus courant */
  spellings: Map<string, number>;
  categories: Set<ContentCategory>;
  /** contenus distincts : un tag écrit deux fois dans un même article ne compte qu'une fois */
  slugs: Set<string>;
}

const accumulate = (contents: Content[]) => {
  const byTag = new Map<string, TagAccumulator>();

  for (const { metadata, slug } of contents) {
    for (const tag of metadata.tags ?? []) {
      const tagSlug = slugifyTag(tag);
      if (!tagSlug) {
        continue;
      }

      const entry = byTag.get(tagSlug) ?? {
        categories: new Set<ContentCategory>(),
        slugs: new Set<string>(),
        spellings: new Map<string, number>(),
      };

      entry.spellings.set(tag, (entry.spellings.get(tag) ?? 0) + 1);
      entry.slugs.add(`${metadata.category}/${slug}`);
      if (metadata.category) {
        entry.categories.add(metadata.category);
      }

      byTag.set(tagSlug, entry);
    }
  }

  return byTag;
};

/** l'orthographe la plus fréquente ; à égalité, la première par ordre alphabétique */
const pickLabel = (spellings: Map<string, number>): string => {
  let best = "";
  let bestCount = 0;

  for (const [spelling, count] of [...spellings].toSorted(
    ([left], [right]) => left.localeCompare(right)
  )) {
    if (count > bestCount) {
      best = spelling;
      bestCount = count;
    }
  }

  return best;
};

/**
 * Index de tous les tags, toutes catégories confondues.
 *
 * Le filtre des pages d'index reste par catégorie ; ici on veut l'inverse — un
 * sujet peut relier un article, un composant et un outil, et c'est précisément
 * ce que le filtrage côté client ne pouvait pas montrer.
 */
export const getTagIndex = (contents: Content[]): TagEntry[] =>
  [...accumulate(contents)]
    .map(([slug, entry]) => ({
      categories: [...entry.categories].toSorted(),
      count: entry.slugs.size,
      label: pickLabel(entry.spellings),
      slug,
      variants: [...entry.spellings.keys()].toSorted(),
    }))
    .toSorted(
      (left, right) =>
        right.count - left.count ||
        left.label.localeCompare(right.label)
    );

/** le tag correspondant à un slug d'URL, ou `null` s'il n'existe pas */
export const getTagBySlug = (
  contents: Content[],
  slug: string
): TagEntry | null =>
  getTagIndex(contents).find((tag) => tag.slug === slug) ?? null;

/** contenus portant ce tag, dans l'ordre de `contents` (donc par date décroissante) */
export const getContentByTagSlug = (
  contents: Content[],
  slug: string
): Content[] =>
  contents.filter((content) =>
    (content.metadata.tags ?? []).some(
      (tag) => slugifyTag(tag) === slug
    )
  );
