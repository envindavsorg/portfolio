import { slugify } from "@/lib/case";
import type {
  Content,
  ContentCategory,
  ContentLocale,
} from "@/lib/content";

interface TagData {
  tagCounts: Record<string, number>;
  tags: string[];
  /**
   * Libellé à afficher pour chaque tag.
   *
   * Le filtre des pages d'index garde la CLÉ comme valeur — c'est elle qui est
   * comptée et écrite dans l'URL. Seul l'affichage est traduit, d'où une table
   * séparée plutôt qu'une traduction de `tags`.
   */
  tagLabels: Record<string, string>;
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

/**
 * Libellés anglais des sujets dont le mot diffère.
 *
 * Un tag est une CLÉ, écrite en français dans le frontmatter parce que le
 * français est la locale de base : c'est cette clé qui produit le slug, donc
 * l'URL. Seul le libellé AFFICHÉ est traduit. C'est le couple `series` /
 * `seriesName` déjà en place pour les séries, appliqué aux sujets.
 *
 * L'état précédent traduisait la clé elle-même, à moitié : `/en` servait à la
 * fois `couleurs` et `colors`, `texte` et `text` — le même sujet sur deux pages,
 * dans le MÊME arbre de langue, selon le fichier qui avait été traduit. Et les
 * deux sujets français sans équivalent anglais n'existaient pas du tout sous
 * `/en`. Une clé partagée rend ces états impossibles au lieu de les corriger un
 * par un : le slug d'un sujet est le même dans les deux arbres, donc un lien
 * partagé retombe toujours sur la même page.
 *
 * Les sujets absents de cette table s'affichent tels quels — c'est le cas de la
 * majorité (`css`, `json`, `jwt`, `git`, `regex`…), qui s'écrivent pareil dans
 * les deux langues. Y ajouter une entrée identique à sa clé serait du bruit.
 */
const EN_TAG_LABELS: Record<string, string> = {
  carrière: "career",
  casse: "case",
  contraste: "contrast",
  couleurs: "colors",
  "retour d'expérience": "lessons learned",
  texte: "text",
};

/** le libellé d'un sujet dans une locale ; la clé elle-même à défaut */
export const tagLabel = (
  tag: string,
  locale: ContentLocale = "fr"
): string =>
  locale === "en" ? (EN_TAG_LABELS[tag.toLowerCase()] ?? tag) : tag;

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

export const getTagData = (
  contents: Content[],
  locale: ContentLocale = "fr"
): TagData => {
  const tagCounts = buildTagCounts(contents);

  const keys = Object.keys(tagCounts).filter((k) => k !== ALL_TAG);
  const tagLabels = Object.fromEntries(
    keys.map((tag) => [tag, tagLabel(tag, locale)])
  );

  // trié sur le LIBELLÉ : en anglais, « lessons learned » ne se range pas là où
  // se rangeait « retour d'expérience »
  const tags = [
    ALL_TAG,
    ...keys.toSorted((left, right) =>
      (tagLabels[left] ?? left).localeCompare(
        tagLabels[right] ?? right
      )
    ),
  ];

  return { tagCounts, tagLabels, tags };
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
export const getTagIndex = (
  contents: Content[],
  locale: ContentLocale = "fr"
): TagEntry[] =>
  [...accumulate(contents)]
    .map(([slug, entry]) => ({
      categories: [...entry.categories].toSorted(),
      count: entry.slugs.size,
      label: tagLabel(pickLabel(entry.spellings), locale),
      slug,
      // les variantes sont montrées au lecteur : elles suivent donc la locale,
      // comme le libellé principal
      variants: [...entry.spellings.keys()]
        .map((spelling) => tagLabel(spelling, locale))
        .toSorted(),
    }))
    .toSorted(
      (left, right) =>
        right.count - left.count ||
        left.label.localeCompare(right.label)
    );

/** le tag correspondant à un slug d'URL, ou `null` s'il n'existe pas */
export const getTagBySlug = (
  contents: Content[],
  slug: string,
  locale: ContentLocale = "fr"
): TagEntry | null =>
  getTagIndex(contents, locale).find((tag) => tag.slug === slug) ??
  null;

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
