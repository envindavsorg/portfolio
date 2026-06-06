import type { Content } from "@/lib/content";

interface TagData {
  tagCounts: Record<string, number>;
  tags: string[];
}

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
