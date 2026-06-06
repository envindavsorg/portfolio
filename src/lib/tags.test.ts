import { describe, expect, it } from "vitest";

import type { Content } from "@/lib/content";
import {
  ALL_TAG,
  getTagData,
  isActiveTag,
  matchesTag,
} from "@/lib/tags";

const makeContent = (tags?: string[]): Content =>
  ({
    content: "",
    metadata: {
      category: "articles",
      createdAt: new Date("2026-01-01"),
      description: "",
      tags,
      title: "test",
      updatedAt: new Date("2026-01-01"),
    },
    reading: { time: "1 minutes", words: 10 },
    slug: "test",
  }) as Content;

describe("matchesTag", () => {
  it("matche tout avec le tag par défaut", () => {
    expect(matchesTag(["css"], ALL_TAG)).toBe(true);
    expect(matchesTag(undefined, ALL_TAG)).toBe(true);
  });

  it("matche un tag indépendamment de la casse", () => {
    expect(matchesTag(["CSS"], "css")).toBe(true);
    expect(matchesTag(["react"], "css")).toBe(false);
  });

  it("ne matche pas sans tags", () => {
    expect(matchesTag(undefined, "css")).toBe(false);
    expect(matchesTag([], "css")).toBe(false);
  });
});

describe("isActiveTag", () => {
  it("gère le tag 'tout'", () => {
    expect(isActiveTag(ALL_TAG, ALL_TAG)).toBe(true);
    expect(isActiveTag(ALL_TAG, "css")).toBe(false);
  });

  it("compare en minuscules", () => {
    expect(isActiveTag("CSS", "css")).toBe(true);
  });
});

describe("getTagData", () => {
  it("compte les contenus par tag avec 'tout' en tête", () => {
    const contents = [
      makeContent(["css", "react"]),
      makeContent(["css"]),
      makeContent(),
    ];

    const { tagCounts, tags } = getTagData(contents);

    expect(tags[0]).toBe(ALL_TAG);
    expect(tagCounts[ALL_TAG]).toBe(3);
    expect(tagCounts.css).toBe(2);
    expect(tagCounts.react).toBe(1);
  });

  it("trie les tags alphabétiquement", () => {
    const contents = [makeContent(["zod", "axe", "motion"])];
    const { tags } = getTagData(contents);
    expect(tags.slice(1)).toEqual(["axe", "motion", "zod"]);
  });
});
