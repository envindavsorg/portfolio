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

interface Weights {
  css: number;
  fonts: number;
  js: number;
}

const FONT_EXTENSION = /\.(?:woff2?|ttf|otf)(?:\?|$)/u;

/**
 * Additionne le poids par type de ressource.
 *
 * Les scripts /_vercel/* sont exclus : ils sont injectés par la plateforme et
 * répondent 404 hors production, leur poids local ne veut donc rien dire.
 */
const measure = (page: Page): Weights => {
  const weights: Weights = { css: 0, fonts: 0, js: 0 };

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
