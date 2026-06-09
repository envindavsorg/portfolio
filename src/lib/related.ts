import type { Content } from "@/lib/content";

const DEFAULT_LIMIT = 3;

// Classe les contenus par nombre de tags partagés, puis par date
// décroissante : les éléments sans tag commun complètent la liste.
export const getRelatedContent = (
  current: Content,
  candidates: Content[],
  limit = DEFAULT_LIMIT
): Content[] => {
  const currentTags = new Set(current.metadata.tags);

  return candidates
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => ({
      candidate,
      score: (candidate.metadata.tags ?? []).filter((tag) =>
        currentTags.has(tag)
      ).length,
    }))
    .toSorted(
      (a, b) =>
        b.score - a.score ||
        b.candidate.metadata.createdAt.getTime() -
          a.candidate.metadata.createdAt.getTime()
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
};
