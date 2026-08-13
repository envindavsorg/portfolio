import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import type { WeightMetric } from "../src/data/weights";
import {
  MEASURED_PAGES,
  WEIGHT_BUDGETS,
  WEIGHT_METRICS,
} from "../src/data/weights";

/**
 * Budgets de poids.
 *
 * Mesurés dans un vrai navigateur, sur ce que la page demande RÉELLEMENT — et
 * non sur la sortie du build. Le chiffre affiché par `next build` agrège des
 * chunks partagés qui ne sont pas tous téléchargés, et n'a donc pas de rapport
 * direct avec ce que reçoit un visiteur.
 *
 * Les plafonds sont des GARDE-FOUS, pas des objectifs atteints : un plafond
 * franchi est un signal à examiner, pas un feu vert pour l'élargir. Ils vivent
 * désormais dans `src/data/weights.ts`, avec les valeurs mesurées que publie la
 * page /weight.
 *
 * Tailles encodées (donc compressées), telles qu'elles passent sur le réseau.
 */

const KIB = 1024;

/**
 * Les plafonds viennent de `src/data/weights.ts`, la même source que la page
 * /weight.
 *
 * Ils vivaient ici en constantes locales, à côté des valeurs mesurées recopiées
 * dans un commentaire. Deux endroits pour un même chiffre : la page publiait donc
 * un poids que ce test ne vérifiait pas, et rien n'aurait signalé qu'ils avaient
 * cessé de parler du même site.
 */
const budget = (metric: WeightMetric) => WEIGHT_BUDGETS[metric] * KIB;

const JS_BUDGET = budget("js");
const FONT_BUDGET = budget("fonts");
const CSS_BUDGET = budget("css");
const IMAGE_BUDGET = budget("images");
const DOCUMENT_BUDGET = budget("document");

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

/**
 * La liste vient elle aussi de `src/data/weights.ts` : la page /weight et ce test
 * parcourent donc exactement le même ensemble. Une page publiée mais jamais
 * mesurée, ou mesurée mais jamais publiée, n'est plus possible.
 */
const PAGES = MEASURED_PAGES.map((page) => page.path);

const toKib = (bytes: number) => Math.round(bytes / KIB);

test.describe("budget de poids", () => {
  for (const path of PAGES) {
    test(`${path} reste dans son budget`, async ({ page }) => {
      const weights = measure(page);

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      /**
       * La mesure est JOURNALISÉE, pas seulement comparée.
       *
       * Les plafonds ont été posés sur des mesures locales, faute de connaître
       * celles de l'intégration continue : sans trace, resserrer davantage
       * revenait à parier sur un environnement qu'on ne voit pas. La ligne
       * ci-dessous met ces chiffres dans le journal de chaque exécution, ce qui
       * transforme la prochaine en mesure de référence.
       */
      console.log(
        `POIDS ${path} js=${toKib(weights.js)} fonts=${toKib(
          weights.fonts
        )} css=${toKib(weights.css)} images=${toKib(
          weights.images
        )} document=${toKib(weights.document)}`
      );

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

  /**
   * Le srcset, vérifié dans le DOM et non dans le HTML.
   *
   * React 19 sérialise l'attribut en `srcSet` (camelCase, écrit verbatim : sa
   * table de renommage ne couvre que class, http-equiv et consorts). Un
   * `grep srcset` sur le HTML construit renvoie donc ZÉRO alors que l'attribut
   * est bien là — j'ai moi-même conclu à tort à un srcset manquant sur cette
   * base. Une assertion DOM est immunisée : le parseur HTML normalise la casse.
   */
  test("les vignettes proposent bien plusieurs tailles", async ({
    page,
  }) => {
    await page.goto("/articles");
    await page.waitForLoadState("networkidle");

    const candidates = await page
      .locator('img[data-slot="dialog-image"]')
      .evaluateAll((nodes) =>
        nodes.map(
          (node) =>
            (node.getAttribute("srcset") ?? "")
              .split(",")
              .filter(Boolean).length
        )
      );

    expect(candidates.length).toBeGreaterThan(0);

    // une vignette sans srcset est servie en pleine résolution : c'est la
    // régression qui a coûté 881 Kio sur cette page
    for (const count of candidates) {
      expect(count).toBeGreaterThanOrEqual(8);
    }
  });
});

/**
 * Cohérence de ce qui est PUBLIÉ.
 *
 * La page /weight annonce des chiffres. Rien ne garantissait qu'ils soient
 * cohérents avec les plafonds qu'ils côtoient, ni que les pages citées existent
 * encore : une entrée recopiée à la main peut annoncer 400 Kio sur une URL
 * supprimée depuis, et la page continuerait de l'afficher.
 */
test.describe("chiffres publiés", () => {
  test("aucune valeur publiée ne dépasse son plafond", () => {
    const offenders = MEASURED_PAGES.flatMap((page) =>
      WEIGHT_METRICS.filter(
        (metric) => page[metric] > WEIGHT_BUDGETS[metric]
      ).map(
        (metric) =>
          `${page.path} · ${metric} ${page[metric]} > ${WEIGHT_BUDGETS[metric]}`
      )
    );

    expect(offenders).toEqual([]);
  });

  test("les pages citées répondent toutes 200", async ({
    request,
  }) => {
    const broken: string[] = [];

    for (const page of MEASURED_PAGES) {
      const response = await request.get(page.path);
      if (response.status() !== 200) {
        broken.push(`${page.path} → ${response.status()}`);
      }
    }

    expect(broken).toEqual([]);
  });
});
