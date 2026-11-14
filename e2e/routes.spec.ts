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

/**
 * Deux contrats différents, volontairement.
 *
 * Une URL de SITEMAP doit répondre 200 directement : annoncer une URL qui
 * redirige revient à demander à un moteur d'indexer une adresse qui n'est pas la
 * canonique. Un lien RENDU, lui, a le droit de rediriger — `localizeHref("/")`
 * produit `/en/`, que Next renvoie en 308 vers `/en`, et c'est le comportement
 * attendu du framework, pas un défaut du site.
 */
const expectAllReachable = async (
  request: APIRequestContext,
  paths: string[],
  { canonical }: { canonical: boolean }
) => {
  const broken: string[] = [];

  for (const path of paths) {
    const response = await request.get(
      path,
      canonical ? { maxRedirects: 0 } : {}
    );

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

    await expectAllReachable(request, paths, { canonical: true });
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

    await expectAllReachable(request, alternates, {
      canonical: true,
    });
  });
});

test.describe("intégrité des liens rendus", () => {
  /**
   * Les sujets sont le cas qui a dérivé : les articles anglais liaient des slugs
   * traduits (`career`, `lessons-learned`) que le build FR ne connaissait pas.
   * Le tag est depuis une clé partagée, mais ce parcours reste la garde — c'est
   * lui qui avait attrapé la divergence, et rien ne dit qu'une autre ne viendra
   * pas d'ailleurs (une série, un fil d'Ariane, un lien écrit à la main).
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

      await expectAllReachable(request, internal, {
        canonical: false,
      });
    });
  }
});

test.describe("pages introuvables", () => {
  /**
   * Une adresse inconnue sous `/en` ne correspondait à aucune route : elle
   * sortait de l'arbre anglais et recevait le 404 global, qui est français.
   * `/en/projects/inconnu`, qui correspond à une route, était bien en anglais —
   * d'où un défaut invisible tant qu'on ne teste que des slugs inconnus.
   */
  for (const { lang, path, wayOut } of [
    {
      lang: "fr",
      path: "/cette-page-n-existe-pas",
      wayOut: "/articles",
    },
    {
      lang: "en",
      path: "/en/cette-page-n-existe-pas",
      wayOut: "/en/articles",
    },
    {
      lang: "en",
      path: "/en/deux/segments-inconnus",
      wayOut: "/en/articles",
    },
  ]) {
    test(`${path} répond 404 dans la bonne langue`, async ({
      page,
    }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);

      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        lang
      );

      // le titre était un h2 : la page n'avait aucun h1
      await expect(page.locator("h1")).toHaveCount(1);

      // la page n'a ni barre de navigation ni pied de page : sans ces liens,
      // sa seule issue était l'accueil
      await expect(
        page.locator(`main a[href='${wayOut}']`)
      ).toBeVisible();

      // les filets d'écran font 200vw : rendue hors du gabarit qui les rogne,
      // la page défilait de 349 px à l'horizontale
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("l'attrape-tout anglais ne masque pas le miroir texte", async ({
    request,
  }) => {
    // `/en/<catégorie>/<slug>.mdx` n'existe que par une réécriture : si
    // l'attrape-tout `en/[...rest]` passait avant elle, « Copy Markdown »
    // recevrait un 404 sur tout l'arbre anglais
    const response = await request.get(
      "/en/articles/my-work-journey.mdx"
    );
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain("<html");
  });
});

test.describe("liens du pied de page", () => {
  /**
   * `/cv`, `/now`, `/uses` et `/weight` ne recevaient AUCUN lien de toute
   * l'interface : au sitemap, donc indexées, mais introuvables en naviguant. Le
   * pied de page est leur seule entrée — ce test échoue si elle disparaît.
   */
  for (const prefix of ["", "/en"]) {
    test(`le pied de ${prefix || "/"} mène aux pages sans autre entrée`, async ({
      page,
      request,
    }) => {
      await page.goto(prefix || "/");

      const hrefs = await page
        .locator("footer nav a")
        .evaluateAll((anchors) =>
          anchors.map((anchor) => anchor.getAttribute("href") ?? "")
        );

      for (const target of ["/cv", "/now", "/uses", "/weight"]) {
        expect(hrefs).toContain(`${prefix}${target}`);
      }

      // tout ce qui est interne doit répondre, flux compris
      await expectAllReachable(
        request,
        hrefs.filter((href) => href.startsWith("/")),
        { canonical: false }
      );
    });
  }

  /**
   * Le pied de /en ouvrait /api/rss : 22 éléments en français, aux liens sans
   * /en. Le test part du lien RENDU puis lit ce qui est servi au bout — un
   * href juste vers un flux dans l'autre langue serait le même défaut.
   */
  for (const [prefix, language] of [
    ["", "fr"],
    ["/en", "en"],
  ] as const) {
    test(`le pied de ${prefix || "/"} ouvre le flux RSS de sa langue`, async ({
      page,
      request,
    }) => {
      await page.goto(prefix || "/");

      const feedLinks = (scope: string): Promise<string[]> =>
        page
          .locator(`${scope} a[href^="/api/rss"]`)
          .evaluateAll((anchors) =>
            anchors.map((anchor) => anchor.getAttribute("href") ?? "")
          );

      const feed = language === "en" ? "/api/rss/en" : "/api/rss";
      expect(await feedLinks("footer nav")).toEqual([feed]);

      // la barre de navigation mène au même flux que le pied, sur ses deux
      // rendus (la rangée de la barre et celle du menu mobile)
      const fromHeader = await feedLinks("header");
      expect(fromHeader.length).toBeGreaterThan(0);
      expect([...new Set(fromHeader)]).toEqual([feed]);

      const xml = await (await request.get(feed)).text();
      expect(xml).toContain(`<language>${language}</language>`);
    });
  }
});
