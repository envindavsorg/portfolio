import type { Content } from "@/lib/content";

export interface RelatedContent {
  content: Content;
  /** nombre de tags partagés avec le contenu courant */
  shared: number;
}

const DEFAULT_LIMIT = 3;

const normalizeTags = (tags: string[] | undefined): Set<string> =>
  new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()));

/**
 * Contenus proches, classés par nombre de tags partagés puis par fraîcheur.
 *
 * Volontairement inter-catégories : un article et un outil qui partagent le tag
 * « css » sont pertinents l'un pour l'autre. Un contenu sans aucun tag commun
 * n'est jamais proposé — mieux vaut ne rien afficher que du bruit.
 */
export const getRelatedContent = (
  current: Content,
  all: Content[],
  limit: number = DEFAULT_LIMIT
): RelatedContent[] => {
  const currentTags = normalizeTags(current.metadata.tags);
  if (currentTags.size === 0) {
    return [];
  }

  const scored: RelatedContent[] = [];

  for (const candidate of all) {
    // comparer les slugs ne suffit pas : le même slug existe en FR et en EN
    if (
      candidate.slug === current.slug &&
      candidate.metadata.category === current.metadata.category
    ) {
      continue;
    }

    let shared = 0;
    for (const tag of normalizeTags(candidate.metadata.tags)) {
      if (currentTags.has(tag)) {
        shared += 1;
      }
    }

    if (shared > 0) {
      scored.push({ content: candidate, shared });
    }
  }

  return scored
    .toSorted((a, b) => {
      if (b.shared !== a.shared) {
        return b.shared - a.shared;
      }
      return (
        new Date(b.content.metadata.createdAt).getTime() -
        new Date(a.content.metadata.createdAt).getTime()
      );
    })
    .slice(0, limit);
};
