import { describe, expect, it } from "vitest";

import type { Content, ContentCategory } from "@/lib/content";
import { getRelatedContent } from "@/lib/related";

const makeContent = (
  slug: string,
  tags: string[],
  createdAt = "2025-01-01",
  category: ContentCategory = "articles"
): Content =>
  ({
    content: "",
    locale: "fr",
    metadata: {
      category,
      createdAt: new Date(createdAt),
      description: "",
      tags,
      title: slug,
      updatedAt: new Date(createdAt),
    },
    reading: { time: "1 minutes", words: 1 },
    slug,
  }) as Content;

describe("getRelatedContent", () => {
  it("ranks by number of shared tags", () => {
    const current = makeContent("current", [
      "css",
      "tailwind",
      "react",
    ]);
    const all = [
      makeContent("one-shared", ["css"]),
      makeContent("three-shared", ["css", "tailwind", "react"]),
      makeContent("two-shared", ["css", "react"]),
    ];

    const related = getRelatedContent(current, all);

    expect(related.map((r) => r.content.slug)).toEqual([
      "three-shared",
      "two-shared",
      "one-shared",
    ]);
    expect(related[0].shared).toBe(3);
  });

  it("excludes content with no shared tag", () => {
    const current = makeContent("current", ["css"]);
    const all = [
      makeContent("unrelated", ["rust", "wasm"]),
      makeContent("related", ["css"]),
    ];

    expect(
      getRelatedContent(current, all).map((r) => r.content.slug)
    ).toEqual(["related"]);
  });

  it("excludes the current entry itself", () => {
    const current = makeContent("same", ["css"]);
    const all = [current, makeContent("other", ["css"])];

    expect(
      getRelatedContent(current, all).map((r) => r.content.slug)
    ).toEqual(["other"]);
  });

  it("keeps a same-slug entry from another category", () => {
    // les slugs ne sont uniques que par catégorie
    const current = makeContent(
      "shared-slug",
      ["css"],
      "2025-01-01",
      "articles"
    );
    const twin = makeContent(
      "shared-slug",
      ["css"],
      "2025-01-01",
      "utils"
    );

    expect(
      getRelatedContent(current, [twin]).map(
        (r) => r.content.metadata.category
      )
    ).toEqual(["utils"]);
  });

  it("returns nothing when the current entry has no tags", () => {
    const current = makeContent("current", []);

    expect(
      getRelatedContent(current, [makeContent("x", ["css"])])
    ).toEqual([]);
  });

  it("breaks ties by recency", () => {
    const current = makeContent("current", ["css"]);
    const all = [
      makeContent("older", ["css"], "2024-01-01"),
      makeContent("newer", ["css"], "2026-01-01"),
    ];

    expect(
      getRelatedContent(current, all).map((r) => r.content.slug)
    ).toEqual(["newer", "older"]);
  });

  it("matches tags case-insensitively", () => {
    const current = makeContent("current", ["CSS", " Tailwind "]);
    const all = [makeContent("other", ["css", "tailwind"])];

    expect(getRelatedContent(current, all)[0].shared).toBe(2);
  });

  it("respects the limit", () => {
    const current = makeContent("current", ["css"]);
    const all = Array.from({ length: 10 }, (_, i) =>
      makeContent(`post-${i}`, ["css"])
    );

    expect(getRelatedContent(current, all, 2)).toHaveLength(2);
  });
});
