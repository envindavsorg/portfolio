import { describe, expect, it } from "vitest";

import { createMetadata, openGraphImage } from "@/lib/metadata";

const titles = (
  meta: ReturnType<typeof createMetadata>
): string[] => {
  const rss = meta.alternates?.types?.["application/rss+xml"];
  return Array.isArray(rss)
    ? rss.map((entry) => String(entry.title))
    : [];
};

describe("createMetadata", () => {
  it("construit le canonical FR sans préfixe", () => {
    const meta = createMetadata({
      description: "desc",
      path: "/articles",
      title: "titre",
    });

    expect(meta.alternates?.canonical).toBe(
      "https://cuzeacflorin.fr/articles"
    );
  });

  it("construit le canonical EN avec préfixe /en", () => {
    const meta = createMetadata({
      description: "desc",
      locale: "en",
      path: "/articles",
      title: "title",
    });

    expect(meta.alternates?.canonical).toBe(
      "https://cuzeacflorin.fr/en/articles"
    );
  });

  it("gère la racine pour les deux locales", () => {
    const fr = createMetadata({
      description: "d",
      path: "/",
      title: "t",
    });
    const en = createMetadata({
      description: "d",
      locale: "en",
      path: "/",
      title: "t",
    });

    expect(fr.alternates?.canonical).toBe("https://cuzeacflorin.fr");
    expect(en.alternates?.canonical).toBe(
      "https://cuzeacflorin.fr/en"
    );
  });

  it("expose les alternates hreflang fr/en/x-default", () => {
    const meta = createMetadata({
      description: "d",
      path: "/utils",
      title: "t",
    });

    expect(meta.alternates?.languages).toEqual({
      en: "https://cuzeacflorin.fr/en/utils",
      fr: "https://cuzeacflorin.fr/utils",
      "x-default": "https://cuzeacflorin.fr/utils",
    });
  });

  it("n'émet pas de canonical sans path", () => {
    const meta = createMetadata({ description: "d", title: "t" });

    expect(meta.alternates?.canonical).toBeUndefined();
    expect(meta.alternates?.languages).toBeUndefined();
  });

  /**
   * Next.js REMPLACE les objets imbriqués de `metadata` au lieu de les fusionner :
   * l'`alternates` d'une page écrase celui du layout racine. Les quatre flux
   * n'étaient donc annoncés sur aucune page du site — zéro occurrence de
   * `application/rss` dans le build, alors que les flux existaient et
   * fonctionnaient. C'est pour ça que ces assertions portent sur `createMetadata`
   * et pas seulement sur `createRootMetadata`.
   */
  it("réémet l'autodécouverte des flux, même sans path", () => {
    const withPath = createMetadata({
      description: "d",
      path: "/articles",
      title: "t",
    });
    const withoutPath = createMetadata({
      description: "d",
      title: "t",
    });

    for (const meta of [withPath, withoutPath]) {
      const rss = meta.alternates?.types?.["application/rss+xml"];
      expect(Array.isArray(rss) && rss).toHaveLength(4);
      expect(
        meta.alternates?.types?.["application/feed+json"]
      ).toBeDefined();
    }
  });

  it("traduit les titres de flux selon la locale", () => {
    const fr = createMetadata({ description: "d", title: "t" });
    const en = createMetadata({
      description: "d",
      locale: "en",
      title: "t",
    });

    expect(titles(fr).join(" ")).toContain("tous les contenus");
    expect(titles(en).join(" ")).toContain("all content");
    // les titres étaient en français dans les deux arbres
    expect(titles(en).join(" ")).not.toContain("composants");
  });

  it("porte le nom du site dans openGraph", () => {
    const meta = createMetadata({ description: "d", title: "t" });

    // déclaré par createRootMetadata, puis écrasé par chaque page
    expect(meta.openGraph?.siteName).toBeTruthy();
  });

  it("bascule og:type sur article et publie les dates", () => {
    const meta = createMetadata({
      article: {
        modifiedTime: "2026-02-02T00:00:00.000Z",
        publishedTime: "2026-01-01T00:00:00.000Z",
        tags: ["css", "next-js"],
      },
      description: "d",
      path: "/articles/x",
      title: "t",
    });

    const og = meta.openGraph as Record<string, unknown>;
    // og:type valait « website » sur les cinq articles du site
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe("2026-01-01T00:00:00.000Z");
    expect(og.modifiedTime).toBe("2026-02-02T00:00:00.000Z");
    expect(og.tags).toEqual(["css", "next-js"]);
  });

  it("retombe sur la date de publication quand rien n'a été modifié", () => {
    const meta = createMetadata({
      article: { publishedTime: "2026-01-01T00:00:00.000Z" },
      description: "d",
      title: "t",
    });

    const og = meta.openGraph as Record<string, unknown>;
    expect(og.modifiedTime).toBe("2026-01-01T00:00:00.000Z");
  });

  it("reste en website quand la page n'est pas un article", () => {
    const meta = createMetadata({
      description: "d",
      path: "/utils",
      title: "t",
    });

    expect((meta.openGraph as Record<string, unknown>).type).toBe(
      "website"
    );
  });
});

describe("openGraphImage", () => {
  it("construit l'URL /api/og avec les paramètres", () => {
    const url = openGraphImage({
      description: "ma description",
      title: "mon titre",
      type: "blog",
    });

    expect(url).toContain("https://cuzeacflorin.fr/api/og?");
    expect(url).toContain("title=mon+titre");
    expect(url).toContain("type=blog");
  });
});
