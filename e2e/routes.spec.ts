import type { APIRequestContext } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Intégrité des routes publiées.
 *
 * Deux URL /en/tags/* ont été PRÉRENDUES EN 404 tout en étant annoncées au
 * sitemap, et quatre sujets anglais réellement liés depuis les articles
 * n'existaient dans aucun `generateStaticParams`. Rien ne l'a vu : les specs
 * existantes visitent une liste d'URL écrite à la main, et une page absente de
 * cette liste n'est jamais demandée.
 *
 * Ces tests partent donc de ce que le site DÉCLARE, pas d'une liste : le sitemap
 * et les liens réellement rendus dans les pages.
 */

const LOC = /<loc>([^<]+)<\/loc>/gu;
const ALTERNATE = /<xhtml:link[^>]*href="([^"]+)"/gu;

const matchAll = (xml: string, pattern: RegExp): string[] => {
  const found = [...xml.matchAll(pattern)].map((match) => match[1]);
  // les entités XML sont échappées dans le sitemap
  return found.map((url) => url.replaceAll("&amp;", "&"));
};

/** Le sitemap contient des URL absolues de production : les rendre locales. */
const toLocalPath = (url: string): string =>
  url.replace("https://cuzeacflorin.fr", "") || "/";

const expectAllOk = async (
  request: APIRequestContext,
  paths: string[]
) => {
  const broken: string[] = [];

  for (const path of paths) {
    const response = await request.get(path, {
      maxRedirects: 0,
    });

    if (response.status() !== 200) {
      broken.push(`${path} → ${response.status()}`);
    }
  }

  expect(broken, `URL cassées :\n${broken.join("\n")}`).toEqual([]);
};

test.describe("intégrité du sitemap", () => {
  test("chaque <loc> répond 200", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const xml = await response.text();
    const paths = [...new Set(matchAll(xml, LOC).map(toLocalPath))];

    // garde-fou sur la garde : un sitemap vide passerait au vert
    expect(paths.length).toBeGreaterThan(50);

    await expectAllOk(request, paths);
  });

  test("chaque hreflang déclaré existe vraiment", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    const xml = await response.text();

    const alternates = [
      ...new Set(matchAll(xml, ALTERNATE).map(toLocalPath)),
    ];

    // c'est LE défaut que ce test attrape : le sitemap annonçait un équivalent
    // anglais pour chaque sujet français, y compris pour ceux qui n'existent
    // pas en anglais et étaient donc prérendus en 404
    expect(alternates.length).toBeGreaterThan(50);

    await expectAllOk(request, alternates);
  });
});

test.describe("intégrité des liens rendus", () => {
  /**
   * Les sujets sont le cas qui a dérivé : les articles anglais lient des slugs
   * traduits (`career`, `lessons-learned`) que le build FR ne connaît pas.
   */
  for (const path of [
    "/articles/my-work-journey",
    "/en/articles/my-work-journey",
    "/tags",
    "/en/tags",
    "/series/parcours",
    "/en/series/parcours",
  ]) {
    test(`les liens internes de ${path} répondent 200`, async ({
      page,
      request,
    }) => {
      await page.goto(path);

      const hrefs = await page
        .locator("a[href^='/']:not([href^='//'])")
        .evaluateAll((anchors) =>
          anchors.map((anchor) => anchor.getAttribute("href") ?? "")
        );

      const internal = [
        ...new Set(
          hrefs
            .filter(Boolean)
            // un fragment seul pointe sur la page courante
            .map((href) => href.split("#")[0])
            .filter((href) => href.length > 0)
        ),
      ];

      expect(internal.length).toBeGreaterThan(3);

      await expectAllOk(request, internal);
    });
  }
});
