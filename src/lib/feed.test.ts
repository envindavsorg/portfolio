import { describe, expect, it } from "vitest";

import type { Content } from "@/lib/content";
import type { FeedItem, FeedMeta } from "@/lib/feed";
import {
  escapeXml,
  toFeedItems,
  toJsonFeed,
  toRfc822,
  toRssXml,
} from "@/lib/feed";

const SITE = "https://example.test";

const meta: FeedMeta = {
  author: "Florin",
  description: "Un flux de test",
  feedUrl: `${SITE}/api/rss`,
  language: "fr",
  siteUrl: SITE,
  title: "Mon flux",
};

const makeItem = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  category: "articles",
  description: "Description",
  published: new Date("2025-06-01T00:00:00Z"),
  tags: ["css"],
  title: "Titre",
  updated: new Date("2025-06-02T00:00:00Z"),
  url: `${SITE}/articles/titre`,
  ...overrides,
});

describe("escapeXml", () => {
  it("escapes the five XML entities", () => {
    expect(escapeXml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;"
    );
  });

  it("escapes ampersands before other entities, not after", () => {
    // une double substitution donnerait &amp;lt;
    expect(escapeXml("<")).toBe("&lt;");
  });
});

describe("toRfc822", () => {
  it("produces a date feed readers can parse", () => {
    const formatted = toRfc822("2026-08-12T00:00:00Z");

    expect(formatted).toBe("Wed, 12 Aug 2026 00:00:00 GMT");
    expect(Number.isNaN(Date.parse(formatted))).toBe(false);
  });
});

describe("toFeedItems", () => {
  const post = {
    content: "",
    locale: "fr",
    metadata: {
      category: "utils",
      createdAt: new Date("2025-01-02"),
      description: "Un outil",
      tags: ["json"],
      title: "Formateur JSON",
      updatedAt: new Date("2025-01-03"),
    },
    reading: { time: "1 minutes", words: 1 },
    slug: "json-formatter",
  } as Content;

  it("builds absolute urls from the category and slug", () => {
    expect(toFeedItems([post], SITE)[0].url).toBe(
      `${SITE}/utils/json-formatter`
    );
  });

  it("defaults a missing category to articles", () => {
    const untyped = {
      ...post,
      metadata: { ...post.metadata, category: undefined },
    } as Content;

    expect(toFeedItems([untyped], SITE)[0].category).toBe("articles");
  });
});

describe("toRssXml", () => {
  it("escapes special characters in titles instead of using CDATA", () => {
    const xml = toRssXml(
      [makeItem({ title: "Tout sur <script> & co" })],
      meta
    );

    expect(xml).toContain("Tout sur &lt;script&gt; &amp; co");
    expect(xml).not.toContain("<script>");
  });

  it("survives content containing a CDATA terminator", () => {
    const xml = toRssXml(
      [makeItem({ description: "un cas limite ]]> ici" })],
      meta
    );

    expect(xml).not.toContain("]]>");
  });

  it("emits a self link and the declared language", () => {
    const xml = toRssXml([makeItem()], meta);

    expect(xml).toContain(
      `<atom:link href="${SITE}/api/rss" rel="self"`
    );
    expect(xml).toContain("<language>fr</language>");
  });

  it("uses the most recent update as lastBuildDate", () => {
    const xml = toRssXml(
      [
        makeItem({ updated: new Date("2025-01-01T00:00:00Z") }),
        makeItem({ updated: new Date("2025-09-09T00:00:00Z") }),
      ],
      meta
    );

    expect(xml).toContain(
      "<lastBuildDate>Tue, 09 Sep 2025 00:00:00 GMT</lastBuildDate>"
    );
  });

  it("emits RFC-822 pubDates, never a localized format", () => {
    const xml = toRssXml([makeItem()], meta);

    expect(xml).toContain(
      "<pubDate>Sun, 01 Jun 2025 00:00:00 GMT</pubDate>"
    );
    expect(xml).not.toContain("juin");
  });

  it("renders an empty but valid channel with no items", () => {
    const xml = toRssXml([], meta);

    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });
});

describe("toJsonFeed", () => {
  it("emits valid JSON Feed 1.1", () => {
    const parsed = JSON.parse(toJsonFeed([makeItem()], meta));

    expect(parsed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(parsed.feed_url).toBe(`${SITE}/api/rss`);
    expect(parsed.items[0].id).toBe(`${SITE}/articles/titre`);
    expect(parsed.items[0].date_published).toBe(
      "2025-06-01T00:00:00.000Z"
    );
  });

  it("merges category and tags", () => {
    const parsed = JSON.parse(
      toJsonFeed([makeItem({ tags: ["css", "layout"] })], meta)
    );

    expect(parsed.items[0].tags).toEqual([
      "articles",
      "css",
      "layout",
    ]);
  });
});
