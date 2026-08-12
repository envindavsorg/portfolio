import { slugify } from "@/lib/case";
import type { Content } from "@/lib/content";

/**
 * Séries de contenus : plusieurs articles qui se lisent dans un ordre donné.
 *
 * La navigation chronologique existante ne suffit pas ici. Elle suit `createdAt`
 * décroissant, donc une série publiée en trois fois se parcourt à l'envers avec
 * les flèches — et rien n'indique au lecteur qu'il entre au milieu d'une suite.
 */

export interface SeriesEntry {
  slug: string;
  /** libellé affiché, traduisible */
  name: string;
  /** parties dans l'ordre de lecture */
  parts: Content[];
}

/**
 * Le slug vient de la CLÉ `series`, jamais du libellé.
 *
 * C'est ce qui permet de traduire le nom d'une série sans changer son URL : la
 * clé reste « parcours » dans les deux langues, seul `seriesName` diffère.
 */
export const seriesSlug = (key: string): string => slugify(key);

/**
 * Ordre de lecture d'une série.
 *
 * Trois critères successifs, et le dernier n'est pas décoratif : deux parties
 * avec le même `seriesOrder` sont une erreur de contenu, mais l'affichage doit
 * rester déterministe. Sans ce départage, l'ordre dépendrait de celui du système
 * de fichiers et pourrait changer d'un build à l'autre.
 */
const byReadingOrder = (left: Content, right: Content): number => {
  const leftOrder =
    left.metadata.seriesOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder =
    right.metadata.seriesOrder ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  const leftDate = new Date(left.metadata.createdAt).getTime();
  const rightDate = new Date(right.metadata.createdAt).getTime();

  return leftDate - rightDate || left.slug.localeCompare(right.slug);
};

export const getSeriesIndex = (
  contents: Content[]
): SeriesEntry[] => {
  const grouped = new Map<
    string,
    { name: string; parts: Content[] }
  >();

  for (const content of contents) {
    const key = content.metadata.series?.trim();
    if (!key) {
      continue;
    }

    const slug = seriesSlug(key);
    if (!slug) {
      continue;
    }

    const entry = grouped.get(slug) ?? {
      name: content.metadata.seriesName?.trim() || key,
      parts: [],
    };
    entry.parts.push(content);
    grouped.set(slug, entry);
  }

  return [...grouped]
    .map(([slug, { name, parts }]) => ({
      name,
      parts: parts.toSorted(byReadingOrder),
      slug,
    }))
    .toSorted((left, right) => left.name.localeCompare(right.name));
};

export const getSeriesBySlug = (
  contents: Content[],
  slug: string
): SeriesEntry | null =>
  getSeriesIndex(contents).find((series) => series.slug === slug) ??
  null;

export interface SeriesNavigation {
  series: SeriesEntry;
  /** rang de la partie courante, à partir de 1 */
  position: number;
  total: number;
  previous: Content | null;
  next: Content | null;
}

/**
 * Situe un contenu dans sa série.
 *
 * Renvoie `null` quand le contenu n'appartient à aucune série, ou quand il est
 * seul dans la sienne : afficher « partie 1 sur 1 » n'apporte rien et donne
 * l'impression d'une série inachevée.
 */
export const getSeriesNavigation = (
  contents: Content[],
  current: Content
): SeriesNavigation | null => {
  const key = current.metadata.series?.trim();
  if (!key) {
    return null;
  }

  const series = getSeriesBySlug(contents, seriesSlug(key));
  if (!series || series.parts.length < 2) {
    return null;
  }

  const index = series.parts.findIndex(
    (part) =>
      part.slug === current.slug &&
      part.metadata.category === current.metadata.category
  );

  if (index === -1) {
    return null;
  }

  return {
    next: series.parts[index + 1] ?? null,
    position: index + 1,
    previous: series.parts[index - 1] ?? null,
    series,
    total: series.parts.length,
  };
};
