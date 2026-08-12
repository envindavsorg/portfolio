import { expect, test } from "@playwright/test";

/**
 * La page CV.
 *
 * `GLOBAL_DATA.CV.url` pointe vers un blob hors domaine, en une seule langue et
 * absent du sitemap : le parcours n'était consultable ni par un moteur, ni par
 * quelqu'un qui ne télécharge pas de PDF. Toutes les données affichées existent
 * déjà dans le dépôt.
 */

/**
 * La signature d'un message Paraglide interpolé au lieu d'être appelé.
 * `/projects.md` a publié exactement cela en production pendant des mois, et la
 * page CV lit les mêmes structures de données.
 */
const COMPILED_FUNCTION = /[=]>|experimentalStaticLocale/u;

test.describe("page CV", () => {
  for (const [path, lang] of [
    ["/cv", "fr"],
    ["/en/cv", "en"],
  ] as const) {
    test(`${path} rend le parcours complet`, async ({ page }) => {
      await page.goto(path);

      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        lang
      );

      const body = page.locator("body");

      // les trois employeurs et les trois établissements
      for (const name of [
        "WeFix by Fnac",
        "SpinalCom",
        "Économat des Armées",
        "ETNA",
      ]) {
        await expect(body).toContainText(name);
      }

      // les quatre certifications, avec leur identifiant vérifiable
      await expect(
        page.locator('[data-slot="cv"] a[href*="nextjs.org/learn"]')
      ).toHaveCount(4);
    });

    test(`${path} n'expose aucun code de fonction`, async ({
      page,
    }) => {
      await page.goto(path);

      /**
       * Deux précautions, chacune apprise en échouant :
       *
       * - portée au CONTENU du CV et non au `<body>` : le script inline de
       *   next-themes contient légitimement des flèches de fonction ;
       * - `innerText` et non `textContent` : le second inclut le texte des
       *   `<script>`, ce qui faisait échouer la garde sur du code sans rapport.
       */
      const text = await page
        .locator('[data-slot="cv"]')
        .textContent();

      expect(text).not.toMatch(COMPILED_FUNCTION);
      expect(text.length).toBeGreaterThan(500);
    });
  }

  test("les deux langues affichent des intitulés différents", async ({
    page,
  }) => {
    await page.goto("/cv");
    const fr = await page.locator("body").textContent();

    await page.goto("/en/cv");
    const en = await page.locator("body").textContent();

    // WORK.jobs et EXPERIENCES divergent, et WORK.jobs n'existe qu'en français :
    // s'en servir afficherait des intitulés français sur /en/cv
    expect(fr).toContain("Lead Développeur Front-End");
    expect(en).not.toContain("Lead Développeur Front-End");
  });

  test("le CV est annoncé au sitemap dans les deux langues", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    const xml = await response.text();

    expect(xml).toContain("https://cuzeacflorin.fr/cv");
    expect(xml).toContain("https://cuzeacflorin.fr/en/cv");
  });

  test("le chrome du site disparaît à l'impression", async ({
    page,
  }) => {
    await page.goto("/cv");
    await page.waitForLoadState("networkidle");

    await page.emulateMedia({ media: "print" });

    // globals.css ne contenait AUCUNE règle d'impression : la navbar, le pied de
    // page et les particules sortaient sur le papier
    await expect(page.locator("nav").first()).toBeHidden();
    await expect(
      page.locator('[data-slot="cv-actions"]')
    ).toBeHidden();

    // le contenu, lui, reste
    await expect(page.locator('[data-slot="cv"]')).toBeVisible();

    await page.emulateMedia({ media: "screen" });
  });
});
