import { describe, expect, it } from "vitest";

import type { Content } from "@/lib/content";
import { getRelatedContent } from "@/lib/related";

const makeContent = (
  slug: string,
  tags: string[],
  createdAt: string
): Content => ({
  content: "",
  locale: "fr",
  metadata: {
    category: "articles",
    createdAt: new Date(createdAt),
    description: "",
    tags,
    title: slug,
    updatedAt: new Date(createdAt),
  },
  reading: { time: "1 minutes", words: 100 },
  slug,
});

describe("getRelatedContent", () => {
  const current = makeContent(
    "current",
    ["react", "nextjs"],
    "2026-01-01"
  );

  it("excludes the current content", () => {
    const related = getRelatedContent(current, [current]);
    expect(related).toHaveLength(0);
  });

  it("prioritizes contents sharing the most tags", () => {
    const candidates = [
      current,
      makeContent("one-tag", ["react"], "2026-01-05"),
      makeContent("two-tags", ["react", "nextjs"], "2026-01-02"),
      makeContent("no-tag", ["css"], "2026-01-09"),
    ];

    const related = getRelatedContent(current, candidates);
    expect(related.map(({ slug }) => slug)).toEqual([
      "two-tags",
      "one-tag",
      "no-tag",
    ]);
  });

  it("breaks ties by most recent date", () => {
    const candidates = [
      makeContent("older", ["react"], "2025-01-01"),
      makeContent("newer", ["react"], "2026-01-01"),
    ];

    const related = getRelatedContent(current, candidates);
    expect(related.map(({ slug }) => slug)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("respects the limit", () => {
    const candidates = [
      makeContent("a", ["react"], "2026-01-01"),
      makeContent("b", ["react"], "2026-01-02"),
      makeContent("c", ["react"], "2026-01-03"),
      makeContent("d", ["react"], "2026-01-04"),
    ];

    expect(getRelatedContent(current, candidates, 2)).toHaveLength(2);
    expect(getRelatedContent(current, candidates)).toHaveLength(3);
  });

  it("falls back to recency when contents have no tags", () => {
    const untaggedCurrent = makeContent("current", [], "2026-01-01");
    const candidates = [
      makeContent("old", [], "2025-01-01"),
      makeContent("recent", [], "2026-02-01"),
    ];

    const related = getRelatedContent(untaggedCurrent, candidates);
    expect(related.map(({ slug }) => slug)).toEqual([
      "recent",
      "old",
    ]);
  });
});
