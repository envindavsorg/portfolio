import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Budgets de poids.
 *
 * Mesurés dans un vrai navigateur, sur ce que la page demande RÉELLEMENT — et
 * non sur la sortie du build. Le chiffre affiché par `next build` agrège des
 * chunks partagés qui ne sont pas tous téléchargés, et n'a donc pas de rapport
 * direct avec ce que reçoit un visiteur.
 *
 * Les plafonds ne sont pas un objectif atteint mais un garde-fou : ils sont posés
 * environ 15 % au-dessus des valeurs mesurées le 12 août 2026, pour attraper une
 * régression sans échouer au moindre écart. Un plafond franchi est un signal à
 * examiner, pas un feu vert pour l'élargir.
 *
 * Tailles encodées (donc compressées), telles qu'elles passent sur le réseau.
 */

const KIB = 1024;

/** JS : 871 ko mesurés au plus lourd (/series/parcours, /utils/regex-tester) */
const JS_BUDGET = 1000 * KIB;
/** polices : 266 ko sur chaque page, trois fontes pixel plus Geist */
const FONT_BUDGET = 300 * KIB;
/** CSS : 23 ko, une seule feuille pour tout le site */
const CSS_BUDGET = 40 * KIB;
/**
 * Images : 10 ko au plus lourd (/articles), 4 ko sur l'accueil.
 *
 * `measure()` ne comptait que .js, .css et les polices : quatre GIF de démo de
 * 2,7 Mio au total ont donc vécu des mois sous un budget « vert ». Le plafond est
 * volontairement large par rapport aux 10 ko mesurés — il n'est pas là pour
 * traquer le kilo-octet, mais pour qu'un fichier lourd redéposé se voie tout de
 * suite.
 */
const IMAGE_BUDGET = 150 * KIB;
/**
 * Document HTML : 84 ko sur l'accueil, 17 à 46 ko ailleurs, en encodé.
 *
 * C'est le poids qui porte la charge RSC. L'index de recherche y a vécu jusqu'à
 * récemment, invisible de toute mesure.
 */
const DOCUMENT_BUDGET = 120 * KIB;

interface Weights {
  css: number;
  document: number;
  fonts: number;
  images: number;
  js: number;
}

const FONT_EXTENSION = /\.(?:woff2?|ttf|otf)(?:\?|$)/u;
const IMAGE_EXTENSION = /\.(?:png|jpe?g|webp|avif|gif|svg)(?:\?|$)/u;

/** l'optimiseur ne met pas d'extension : /_next/image?url=…&w=…&q=… */
const OPTIMIZED_IMAGE = "/_next/image";

/**
 * Additionne le poids par type de ressource.
 *
 * Les scripts /_vercel/* sont exclus : ils sont injectés par la plateforme et
 * répondent 404 hors production, leur poids local ne veut donc rien dire.
 */
const measure = (page: Page): Weights => {
  const weights: Weights = {
    css: 0,
    document: 0,
    fonts: 0,
    images: 0,
    js: 0,
  };

  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/_vercel/")) {
      return;
    }

    let bytes = 0;
    try {
      const sizes = await response.request().sizes();
      bytes = sizes.responseBodySize;
    } catch {
      // la requête peut avoir été annulée : elle ne compte pas
      return;
    }

    if (url.endsWith(".js")) {
      weights.js += bytes;
    } else if (url.endsWith(".css")) {
      weights.css += bytes;
    } else if (FONT_EXTENSION.test(url)) {
      weights.fonts += bytes;
    } else if (
      url.includes(OPTIMIZED_IMAGE) ||
      IMAGE_EXTENSION.test(url)
    ) {
      weights.images += bytes;
    } else if (response.request().resourceType() === "document") {
      weights.document += bytes;
    }
  });

  return weights;
};

const PAGES = [
  "/",
  "/en",
  "/articles",
  "/articles/how-i-write-css",
  "/utils/regex-tester",
  "/tags",
  "/search",
  "/series/parcours",
];

const toKib = (bytes: number) => Math.round(bytes / KIB);

test.describe("budget de poids", () => {
  for (const path of PAGES) {
    test(`${path} reste dans son budget`, async ({ page }) => {
      const weights = measure(page);

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // message explicite : un budget dépassé doit dire de combien, sinon la
      // première réaction est d'élargir le plafond au hasard
      expect(
        weights.js,
        `JS sur ${path} : ${toKib(weights.js)} ko pour ${toKib(
          JS_BUDGET
        )} ko de budget`
      ).toBeLessThanOrEqual(JS_BUDGET);

      expect(
        weights.fonts,
        `polices sur ${path} : ${toKib(weights.fonts)} ko pour ${toKib(
          FONT_BUDGET
        )} ko de budget`
      ).toBeLessThanOrEqual(FONT_BUDGET);

      expect(
        weights.css,
        `CSS sur ${path} : ${toKib(weights.css)} ko pour ${toKib(
          CSS_BUDGET
        )} ko de budget`
      ).toBeLessThanOrEqual(CSS_BUDGET);

      expect(
        weights.images,
        `images sur ${path} : ${toKib(weights.images)} ko pour ${toKib(
          IMAGE_BUDGET
        )} ko de budget`
      ).toBeLessThanOrEqual(IMAGE_BUDGET);

      expect(
        weights.document,
        `document sur ${path} : ${toKib(
          weights.document
        )} ko pour ${toKib(DOCUMENT_BUDGET)} ko de budget`
      ).toBeLessThanOrEqual(DOCUMENT_BUDGET);
    });
  }

  test("le nombre de polices préchargées reste bas", async ({
    page,
  }) => {
    await page.goto("/");

    // trois préchargements : cinq fontes pixel sont déclarées, quatre ne servent
    // qu'à un effet et portent preload: false. Une régression ici coûte ~100 ko
    // sur CHAQUE page — c'est arrivé, d'où ce test.
    const preloads = await page
      .locator('link[rel="preload"][as="font"]')
      .count();

    expect(preloads).toBeLessThanOrEqual(3);
  });
});

/**
 * Aucune image ne doit contourner l'optimiseur.
 *
 * Les vignettes de /articles ont été servies en 6016 px bruts, sans srcset,
 * parce qu'un composant rendait un `<img>` au lieu d'un next/image. Rien ne
 * pouvait le signaler : le poids d'image n'était mesuré nulle part, et un
 * `<img>` est parfaitement valide.
 *
 * Les bannières animées des démos du registre sont la seule exception assumée —
 * l'optimiseur rendrait une image FIXE d'un fichier animé, remplaçant la démo
 * par sa première image.
 */
test.describe("aucune image hors de l'optimiseur", () => {
  const ANIMATED_DEMOS = "-demo/";

  for (const path of ["/", "/articles", "/tags", "/en/articles"]) {
    test(`${path} ne sert aucune image brute`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const raw = await page
        .locator('img[src^="/images/"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("src") ?? "")
        );

      const unexpected = raw.filter(
        (src) => !src.includes(ANIMATED_DEMOS)
      );

      expect(
        unexpected,
        `images servies hors de l'optimiseur sur ${path}`
      ).toEqual([]);
    });
  }
});
