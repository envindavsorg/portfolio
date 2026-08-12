import { expect, test } from "@playwright/test";

/**
 * Flux et miroirs texte brut.
 *
 * Ces routes n'ont aucune interface : personne ne les ouvre par hasard, et une
 * régression y passerait inaperçue pendant des mois. Le test vérifie ce qui les
 * rend consommables — le bon Content-Type, un contenu bien formé, et des URL
 * absolues (un lecteur RSS n'a aucun moyen de résoudre un chemin relatif).
 */

const CATEGORIES = ["articles", "components", "utils"] as const;

test.describe("flux RSS", () => {
  test("le flux global est un RSS 2.0 bien formé", async ({
    request,
  }) => {
    const response = await request.get("/api/rss");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(
      "application/rss+xml"
    );

    const xml = await response.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
    expect(xml).toContain("<rss xmlns:dc=");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("</rss>");

    // au moins un article, et des liens absolus
    expect(xml).toContain("<item>");
    expect(xml).toMatch(/<link>https:\/\/[^<]+<\/link>/u);
    expect(xml).not.toMatch(/<link>\/[^<]*<\/link>/u);
  });

  for (const category of CATEGORIES) {
    test(`le flux ${category} ne contient que cette catégorie`, async ({
      request,
    }) => {
      const response = await request.get(`/api/rss/${category}`);
      expect(response.status()).toBe(200);

      const xml = await response.text();
      const links = [...xml.matchAll(/<guid[^>]*>([^<]+)<\/guid>/gu)]
        .map(([, url]) => url ?? "")
        .filter((url) => url.length > 0);

      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link).toContain(`/${category}/`);
      }
    });
  }

  test("une catégorie inconnue renvoie 404", async ({ request }) => {
    const response = await request.get("/api/rss/inexistant");
    expect(response.status()).toBe(404);
  });

  test("les caractères spéciaux sont échappés", async ({
    request,
  }) => {
    const response = await request.get("/api/rss/articles");
    const xml = await response.text();

    // « Comment j'écris du CSS » : l'apostrophe doit sortir en entité, sinon
    // certains lecteurs cassent
    expect(xml).toContain("j&apos;écris");
    // et surtout aucun & nu, qui rendrait le document mal formé
    expect(xml).not.toMatch(/&(?![a-z]+;|#\d+;)/u);
  });
});

test.describe("JSON Feed", () => {
  test("respecte la version 1.1 du format", async ({ request }) => {
    const response = await request.get("/api/feed.json");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(
      "application/feed+json"
    );

    const feed = (await response.json()) as {
      version: string;
      title: string;
      home_page_url: string;
      feed_url: string;
      items: { id: string; url: string; title: string }[];
    };

    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.title).toBeTruthy();
    expect(feed.home_page_url).toMatch(/^https:\/\//u);
    expect(feed.feed_url).toContain("/api/feed.json");

    expect(feed.items.length).toBeGreaterThan(0);
    for (const item of feed.items) {
      expect(item.id).toMatch(/^https:\/\//u);
      expect(item.url).toMatch(/^https:\/\//u);
      expect(item.title).toBeTruthy();
    }
  });
});

test.describe("miroir texte brut", () => {
  test("llms.txt indexe le contenu en markdown", async ({
    request,
  }) => {
    const response = await request.get("/llms.txt");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(
      "text/markdown"
    );

    const text = await response.text();
    expect(text).toContain("# ");
    expect(text).toContain("/articles/how-i-write-css");
  });

  for (const path of [
    "/about.md",
    "/experience.md",
    "/projects.md",
  ]) {
    test(`${path} est servi en markdown`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain(
        "text/markdown"
      );
      const body = await response.text();
      expect(body.length).toBeGreaterThan(100);
    });
  }

  test("la source .mdx d'un article est servie dans les deux langues", async ({
    request,
  }) => {
    const fr = await request.get("/articles/how-i-write-css.mdx");
    const en = await request.get("/en/articles/how-i-write-css.mdx");

    expect(fr.status()).toBe(200);
    expect(en.status()).toBe(200);

    const frText = await fr.text();
    const enText = await en.text();

    expect(frText).toContain("Comment j'écris du CSS");
    expect(enText).toContain("How I Write CSS");

    // le miroir anglais existait sans son pendant : « Copy Markdown » sur /en
    // renvoyait la source française
    expect(enText).not.toEqual(frText);
  });
});
