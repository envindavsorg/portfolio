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

/** ouvre l'onglet du bac à sable */
const openPlayground = async (page: Page, label = "bac à sable") => {
  await page.waitForLoadState("networkidle");
  await page.getByRole("tab", { name: label }).click();
  await expect(page.locator(playground)).toBeVisible();
};

/**
 * Un onglet répond TOUT DE SUITE.
 *
 * Ce test vient d'une instabilité de `a11y.spec.ts` en intégration continue : le
 * bouton de copie du bac à sable n'était « pas trouvé », par intermittence. La
 * cause était dans `TabsAnimated`, pas dans le test.
 *
 * `handleTabClick` refuse de changer d'onglet pendant une animation. Or
 * `onAnimationStart` se déclenche aussi à l'ENTRÉE du premier panneau : chaque
 * clic était donc jeté en silence pendant les 0,4 s du ressort après le montage.
 * Mesuré avant correction : clic à 0, 100, 250 et 400 ms ⇒ `aria-selected` reste
 * à `false` et le panneau ne s'ouvre jamais ; à 600 ms ⇒ ça marche.
 *
 * ⚠️ La note qui vivait ici auparavant attribuait ça à l'hydratation, et c'était
 * FAUX : le même clic à 0 ms fonctionne dès que le garde ne s'applique plus à
 * l'animation d'entrée. L'attente `networkidle` d'`openPlayground` n'était donc
 * pas ce qui rendait ces tests fiables — elle passait juste assez de temps pour
 * que le ressort se termine.
 *
 * Les délais testés sont ceux de la mesure, à dessein : ils échouent tous si le
 * garde revient couvrir le montage.
 */
test.describe("réactivité des onglets", () => {
  for (const delay of [0, 100, 250, 400]) {
    test(`l'onglet répond à un clic ${delay} ms après le chargement`, async ({
      page,
    }) => {
      await page.goto("/components/flip-sentences-component");

      if (delay > 0) {
        await page.waitForTimeout(delay);
      }

      const tab = page.getByRole("tab", { name: "bac à sable" });
      await tab.click();

      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator(playground)).toBeVisible();
    });
  }

  /**
   * Le garde garde toujours : deux clics à la suite ne doivent pas laisser la
   * sélection et le panneau affiché en désaccord.
   *
   * ⚠️ Piège de sélecteur, à ajouter à la liste du dépôt : une page de composant
   * porte TROIS `role="tablist"` — l'aperçu, plus les deux blocs de commande
   * npm/pnpm/yarn/bun. Un `[aria-selected='true']` à l'échelle de la page en
   * trouve donc trois, ce qui ressemble à un défaut d'accessibilité et n'en est
   * pas. On se limite au premier tablist.
   */
  test("deux changements d'onglet enchaînés restent cohérents", async ({
    page,
  }) => {
    await page.goto("/components/flip-sentences-component");
    await page.waitForLoadState("networkidle");

    const tablist = page.locator("[role='tablist']").first();

    await tablist.getByRole("tab", { name: "bac à sable" }).click();
    await tablist.getByRole("tab", { name: "composant" }).click();

    const selected = tablist.locator(
      "[role='tab'][aria-selected='true']"
    );
    await expect(selected).toHaveCount(1);

    // le panneau affiché doit désigner l'onglet réellement sélectionné
    const panel = page.locator("[role='tabpanel']").first();
    await expect(panel).toHaveAttribute(
      "aria-labelledby",
      (await selected.getAttribute("id")) ?? ""
    );
  });
});

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
