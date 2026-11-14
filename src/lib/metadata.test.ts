import { describe, expect, it } from "vitest";

import type { Content } from "@/lib/content";
import {
  createContentMetadata,
  createMetadata,
  createRootMetadata,
  openGraphImage,
  TITLE_TEMPLATE,
} from "@/lib/metadata";

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

  // Les pages /en annonçaient les cinq flux FRANÇAIS sous des libellés
  // anglais : 22 éléments en français, aucun lien vers /en.
  it("n'annonce sous /en que les deux flux anglais", () => {
    const { types } = createMetadata({
      description: "d",
      locale: "en",
      title: "t",
    }).alternates ?? { types: undefined };

    expect(types?.["application/rss+xml"]).toEqual([
      {
        title: "florin cuzeac — all content",
        url: "https://cuzeacflorin.fr/api/rss/en",
      },
    ]);
    expect(types?.["application/feed+json"]).toEqual([
      {
        title: "florin cuzeac — JSON Feed",
        url: "https://cuzeacflorin.fr/api/feed.en.json",
      },
    ]);
  });

  it("garde les cinq flux français sur l'arbre français", () => {
    const rss = createMetadata({ description: "d", title: "t" })
      .alternates?.types?.["application/rss+xml"];

    expect(
      Array.isArray(rss) && rss.map((entry) => String(entry.url))
    ).toEqual([
      "https://cuzeacflorin.fr/api/rss",
      "https://cuzeacflorin.fr/api/rss/articles",
      "https://cuzeacflorin.fr/api/rss/components",
      "https://cuzeacflorin.fr/api/rss/utils",
    ]);
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

describe("titre du document", () => {
  // sur 136 URL, seul l'accueil portait le nom ; les quatre anciens gabarits
  // finissaient par « Portfolio personnel » ou « Articles, composants et outils web »
  it("n'a qu'un gabarit, qui porte le nom, pour les deux arbres", () => {
    expect(TITLE_TEMPLATE).toBe("%s — florin cuzeac");

    for (const locale of ["fr", "en"] as const) {
      expect(createRootMetadata(locale).title).toEqual({
        default: "florin cuzeac",
        template: "%s — florin cuzeac",
      });
    }
  });

  it("laisse une page ordinaire passer par le gabarit", () => {
    const meta = createMetadata({
      description: "d",
      title: "Projets",
    });

    // une chaîne : Next lui applique le gabarit du layout racine
    expect(meta.title).toBe("Projets");
  });

  // l'accueil a pour titre le nom du site : par le gabarit, il s'intitulerait
  // « florin cuzeac — florin cuzeac »
  it("sort l'accueil du gabarit sans toucher au titre des cartes", () => {
    const meta = createMetadata({
      absoluteTitle: "florin cuzeac — développeur",
      description: "d",
      title: "florin cuzeac",
    });

    expect(meta.title).toEqual({
      absolute: "florin cuzeac — développeur",
    });
    expect(meta.openGraph?.title).toBe("florin cuzeac");
    expect(meta.twitter?.title).toBe("florin cuzeac");
  });

  // `<meta name="author">` annonçait le pseudo GitHub quand `article:author`
  // et le JSON-LD donnent le nom
  it("signe du nom, pas du pseudo", () => {
    const root = createRootMetadata("fr");

    expect(root.creator).toBe("florin cuzeac");
    expect(root.authors).toEqual([
      { name: "florin cuzeac", url: "https://cuzeacflorin.fr" },
    ]);
  });
});

describe("createContentMetadata", () => {
  const article = (locale: Content["locale"]): Content => ({
    content: "",
    locale,
    metadata: {
      category: "articles",
      createdAt: new Date("2026-03-03T00:00:00.000Z"),
      description: "d",
      tags: ["css", "retour d'expérience"],
      title: "t",
      updatedAt: new Date("2026-03-04T00:00:00.000Z"),
    } as Content["metadata"],
    reading: { time: "8 min", words: 1077 },
    slug: "how-i-write-css",
  });

  const tags = (content: Content, locale: "fr" | "en") =>
    (
      createContentMetadata(content, locale).openGraph as Record<
        string,
        unknown
      >
    ).tags;

  // un tag est une CLÉ, écrite en français : `article:tag` d'un article
  // anglais annonçait « retour d'expérience »
  it("publie le libellé des tags dans la langue du contenu", () => {
    expect(tags(article("en"), "en")).toEqual([
      "css",
      "lessons learned",
    ]);
    expect(tags(article("fr"), "fr")).toEqual([
      "css",
      "retour d'expérience",
    ]);
  });

  // un article sans traduction est servi en français sous /en : ses sujets
  // restent ceux qui sont affichés sous lui, en français
  it("garde les clés pour un repli français servi sous /en", () => {
    expect(tags(article("fr"), "en")).toEqual([
      "css",
      "retour d'expérience",
    ]);
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
