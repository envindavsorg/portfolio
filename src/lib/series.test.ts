import { describe, expect, it } from "vitest";

import type { Content } from "@/lib/content";
import {
  getSeriesBySlug,
  getSeriesIndex,
  getSeriesNavigation,
  seriesSlug,
} from "@/lib/series";

const makeContent = ({
  slug,
  series,
  seriesOrder,
  createdAt = "2026-01-01",
}: {
  slug: string;
  series?: string;
  seriesOrder?: number;
  createdAt?: string;
}): Content =>
  ({
    content: "",
    metadata: {
      category: "articles",
      createdAt: new Date(createdAt),
      description: "",
      series,
      seriesOrder,
      title: slug,
      updatedAt: new Date(createdAt),
    },
    reading: { time: "1 minutes", words: 10 },
    slug,
  }) as Content;

describe("seriesSlug", () => {
  it("translittère le nom de la série", () => {
    expect(seriesSlug("Mon parcours")).toBe("mon-parcours");
    expect(seriesSlug("Next.js en détail")).toBe("next-js-en-detail");
  });
});

describe("getSeriesIndex", () => {
  it("regroupe les parties et les ordonne", () => {
    const contents = [
      makeContent({ series: "Parcours", seriesOrder: 3, slug: "c" }),
      makeContent({ series: "Parcours", seriesOrder: 1, slug: "a" }),
      makeContent({ series: "Parcours", seriesOrder: 2, slug: "b" }),
    ];

    const [series] = getSeriesIndex(contents);

    expect(series?.slug).toBe("parcours");
    expect(series?.parts.map((part) => part.slug)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("ignore les contenus sans série", () => {
    const contents = [
      makeContent({ slug: "seul" }),
      makeContent({ series: "Parcours", seriesOrder: 1, slug: "a" }),
    ];

    expect(getSeriesIndex(contents)).toHaveLength(1);
  });

  it("ignore un nom de série vide", () => {
    const contents = [
      makeContent({ series: "   ", seriesOrder: 1, slug: "a" }),
    ];

    expect(getSeriesIndex(contents)).toEqual([]);
  });

  it("place les parties sans rang à la fin", () => {
    const contents = [
      makeContent({ series: "Parcours", slug: "sans-rang" }),
      makeContent({ series: "Parcours", seriesOrder: 1, slug: "a" }),
    ];

    const [series] = getSeriesIndex(contents);
    expect(series?.parts.map((part) => part.slug)).toEqual([
      "a",
      "sans-rang",
    ]);
  });

  it("départage deux rangs identiques par date puis par slug", () => {
    // deux mêmes rangs sont une erreur de contenu, mais l'ordre affiché doit
    // rester le même d'un build à l'autre
    const contents = [
      makeContent({
        createdAt: "2026-03-01",
        series: "Parcours",
        seriesOrder: 1,
        slug: "tard",
      }),
      makeContent({
        createdAt: "2026-01-01",
        series: "Parcours",
        seriesOrder: 1,
        slug: "tot",
      }),
    ];

    const [series] = getSeriesIndex(contents);
    expect(series?.parts.map((part) => part.slug)).toEqual([
      "tot",
      "tard",
    ]);
  });

  it("trie les séries par nom", () => {
    const contents = [
      makeContent({ series: "Zod", seriesOrder: 1, slug: "z" }),
      makeContent({ series: "Angular", seriesOrder: 1, slug: "a" }),
    ];

    expect(getSeriesIndex(contents).map((s) => s.name)).toEqual([
      "Angular",
      "Zod",
    ]);
  });
});

describe("getSeriesBySlug", () => {
  it("retrouve une série", () => {
    const contents = [
      makeContent({
        series: "Mon parcours",
        seriesOrder: 1,
        slug: "a",
      }),
    ];

    expect(getSeriesBySlug(contents, "mon-parcours")?.name).toBe(
      "Mon parcours"
    );
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(getSeriesBySlug([], "inexistant")).toBeNull();
  });
});

describe("getSeriesNavigation", () => {
  const parts = [
    makeContent({ series: "Parcours", seriesOrder: 1, slug: "a" }),
    makeContent({ series: "Parcours", seriesOrder: 2, slug: "b" }),
    makeContent({ series: "Parcours", seriesOrder: 3, slug: "c" }),
  ];

  it("situe la partie courante", () => {
    const nav = getSeriesNavigation(parts, parts[1] as Content);

    expect(nav?.position).toBe(2);
    expect(nav?.total).toBe(3);
    expect(nav?.previous?.slug).toBe("a");
    expect(nav?.next?.slug).toBe("c");
  });

  it("n'a pas de précédent sur la première partie", () => {
    const nav = getSeriesNavigation(parts, parts[0] as Content);

    expect(nav?.position).toBe(1);
    expect(nav?.previous).toBeNull();
    expect(nav?.next?.slug).toBe("b");
  });

  it("n'a pas de suivant sur la dernière partie", () => {
    const nav = getSeriesNavigation(parts, parts[2] as Content);

    expect(nav?.next).toBeNull();
    expect(nav?.previous?.slug).toBe("b");
  });

  it("renvoie null hors série", () => {
    const solo = makeContent({ slug: "solo" });
    expect(getSeriesNavigation([solo], solo)).toBeNull();
  });

  it("renvoie null pour une série d'une seule partie", () => {
    // « partie 1 sur 1 » n'apprend rien et suggère une série inachevée
    const only = makeContent({
      series: "Parcours",
      seriesOrder: 1,
      slug: "seul",
    });

    expect(getSeriesNavigation([only], only)).toBeNull();
  });

  it("distingue deux contenus de même slug dans des catégories différentes", () => {
    const article = makeContent({
      series: "Parcours",
      seriesOrder: 1,
      slug: "doublon",
    });
    const tool = {
      ...makeContent({
        series: "Parcours",
        seriesOrder: 2,
        slug: "doublon",
      }),
      metadata: {
        ...makeContent({
          series: "Parcours",
          seriesOrder: 2,
          slug: "doublon",
        }).metadata,
        category: "utils" as const,
      },
    } as Content;

    const nav = getSeriesNavigation([article, tool], tool);

    expect(nav?.position).toBe(2);
    expect(nav?.previous?.metadata.category).toBe("articles");
  });
});
