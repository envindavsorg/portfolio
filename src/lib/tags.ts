import type { Content } from "@/lib/content";

interface TagFilterResult {
  activeTag: string;
  contents: Content[];
  tagCounts: Record<string, number>;
  tags: string[];
}

export const ALL_TAG = "tout";

export const isActiveTag = (tag: string, activeTag: string) =>
  tag === ALL_TAG
    ? activeTag === ALL_TAG
    : activeTag === tag.toLowerCase();

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

const filterContents = (
  contents: Content[],
  tag?: string
): Content[] => {
  const normalized = tag?.toLowerCase();

  if (!normalized || normalized === ALL_TAG) {
    return contents;
  }

  return contents.filter(({ metadata }) =>
    metadata.tags?.some((t) => t.toLowerCase() === normalized)
  );
};

export const filterByTag = (
  contents: Content[],
  tag?: string
): TagFilterResult => {
  const tagCounts = buildTagCounts(contents);

  const tags = [
    ALL_TAG,
    ...Object.keys(tagCounts)
      .filter((k) => k !== ALL_TAG)
      .toSorted(),
  ];

  return {
    activeTag: tag || ALL_TAG,
    contents: filterContents(contents, tag),
    tagCounts,
    tags,
  };
};
