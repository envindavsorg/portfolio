import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Bac à sable des composants du registre.
 *
 * L'intérêt n'est pas de bouger un curseur, c'est que le code affiché
 * corresponde exactement à ce qu'on vient de régler et reste copiable tel quel.
 * Les tests portent donc surtout sur le code généré.
 */

const playground = "[data-slot='component-playground']";

/**
 * Ouvre l'onglet, après hydratation.
 *
 * L'attente n'est pas décorative : le bouton existe dans le HTML servi, mais son
 * gestionnaire React n'est attaché qu'après l'hydratation. Cliquer avant réussit
 * du point de vue du DOM et ne change rien — le panneau n'apparaît jamais.
 */
const openPlayground = async (page: Page, label = "bac à sable") => {
  await page.waitForLoadState("networkidle");
  await page.getByRole("tab", { name: label }).click();
  await expect(page.locator(playground)).toBeVisible();
};

test.describe("bac à sable", () => {
  test("l'onglet n'existe que pour un composant réglable", async ({
    page,
  }) => {
    await page.goto("/components/flip-sentences-component");
    await expect(
      page.getByRole("tab", { name: "bac à sable" })
    ).toHaveCount(1);

    // ThemeSwitcher ne prend aucune prop : un bac à sable vide serait pire que rien
    await page.goto("/components/theme-switcher-component");
    await expect(
      page.getByRole("tab", { name: "bac à sable" })
    ).toHaveCount(0);
  });

  test("part d'un extrait sans aucune prop", async ({ page }) => {
    await page.goto("/components/flip-sentences-component");
    await openPlayground(page);

    // tout est au défaut : recopier ces valeurs donnerait un extrait que
    // personne n'écrirait à la main
    await expect(page.locator(`${playground} pre`)).toHaveText(
      "<FlipSentences />"
    );
  });

  test("un nombre modifié apparaît entre accolades", async ({
    page,
  }) => {
    await page.goto("/components/flip-sentences-component");
    await openPlayground(page);

    await page.getByLabel("intervalle en millisecondes").fill("800");

    await expect(page.locator(`${playground} pre`)).toHaveText(
      "<FlipSentences interval={800} />"
    );
  });

  test("un booléen vrai s'écrit en forme courte", async ({
    page,
  }) => {
    await page.goto("/components/flip-sentences-component");
    await openPlayground(page);

    // par le rôle et non par le libellé : Base UI rend un <input> caché qui porte
    // l'id, en plus du span role="checkbox" qui est le vrai contrôle
    await page
      .getByRole("checkbox", { name: "désactiver l'animation" })
      .click();

    await expect(page.locator(`${playground} pre`)).toHaveText(
      "<FlipSentences disableAnimation />"
    );
  });

  test("les phrases modifiées deviennent un littéral de tableau", async ({
    page,
  }) => {
    await page.goto("/components/flip-sentences-component");
    await openPlayground(page);

    await page
      .getByLabel("phrases, une par ligne")
      .fill("premier\nsecond");

    await expect(page.locator(`${playground} pre`)).toContainText(
      'sentences={["premier", "second"]}'
    );
  });

  test("le composant rendu suit les réglages", async ({ page }) => {
    await page.goto("/components/flip-sentences-component");
    await openPlayground(page);

    await page
      .getByLabel("phrases, une par ligne")
      .fill("une phrase de test");

    // la phrase saisie doit apparaître dans l'aperçu, pas seulement dans le code
    await expect(
      page.locator(playground).getByText("une phrase de test").first()
    ).toBeVisible();
  });

  test("le retour aux valeurs par défaut remet tout à zéro", async ({
    page,
  }) => {
    await page.goto("/components/flip-sentences-component");
    await openPlayground(page);

    await page.getByLabel("intervalle en millisecondes").fill("500");
    await page
      .getByRole("checkbox", { name: "désactiver l'animation" })
      .click();
    await expect(page.locator(`${playground} pre`)).not.toHaveText(
      "<FlipSentences />"
    );

    await page
      .getByRole("button", {
        name: "revenir aux valeurs par défaut",
      })
      .click();

    await expect(page.locator(`${playground} pre`)).toHaveText(
      "<FlipSentences />"
    );
  });

  test("fonctionne aussi pour l'effet Apple", async ({ page }) => {
    await page.goto("/components/writing-effect-inspired-by-apple");
    await openPlayground(page);

    await page.getByLabel("vitesse du tracé").fill("2");

    await expect(page.locator(`${playground} pre`)).toHaveText(
      "<AppleHelloEffect speed={2} />"
    );
  });

  test("le bac à sable existe aussi en anglais", async ({ page }) => {
    await page.goto("/en/components/flip-sentences-component");

    await openPlayground(page, "playground");

    await page.getByLabel("interval in milliseconds").fill("900");
    await expect(page.locator(`${playground} pre`)).toHaveText(
      "<FlipSentences interval={900} />"
    );
  });
});
