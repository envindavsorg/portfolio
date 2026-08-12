import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Scan d'accessibilité automatique (axe-core), règles WCAG 2.0 et 2.1 niveaux A
 * et AA.
 *
 * Beaucoup d'accessibilité a été corrigée à la main sur ce site ; rien
 * n'empêchait une régression. Ce scan ne remplace pas une vérification manuelle —
 * il attrape la moitié mécanique du problème (contrastes, noms accessibles,
 * rôles, ordre des titres) et laisse le reste au jugement.
 *
 * Seul le thème CLAIR est scanné. Forcer le thème sombre via localStorage donne
 * des mesures qu'axe lui-même ne résout pas correctement : il rapporte un fond
 * blanc alors que le document porte bien la classe `dark`. Un test à deux thèmes
 * dont la moitié mesure faux vaut moins qu'un test à un thème fiable. Le
 * contraste du thème sombre reste donc à vérifier à la main.
 */

const PAGES = [
  "/",
  "/en",
  "/articles",
  "/articles/how-i-write-css",
  "/components",
  "/components/theme-switcher-component",
  "/components/flip-sentences-component",
  "/utils",
  "/utils/regex-tester",
  "/utils/contrast-checker",
  "/utils/hash-generator",
  "/tags",
  "/tags/react",
  "/search",
  "/series",
  "/series/parcours",
];

/**
 * Dette de contraste connue, mesurée et assumée.
 *
 * Les deux entrées viennent de jetons de design, pas du balisage : les corriger
 * change l'apparence du site partout, ce qui appartient à son auteur. Elles sont
 * listées ici pour rester visibles plutôt que d'être noyées dans un scan rouge —
 * et toute NOUVELLE violation fait échouer le test.
 */
const KNOWN_CONTRAST_DEBT = [
  {
    background: "#faf9f6",
    foreground: "#306fdc",
    reason:
      "couleur de thème sur fond clair, 4.49:1 pour 4.5 requis — il manque 0.01, mais c'est la couleur de marque du site",
  },
  {
    background: "#ffffff",
    foreground: "#e36209",
    reason:
      "jeton orange du thème Shiki clair dans les blocs de code, 3.48:1 — corriger demande de remplacer le thème de coloration",
  },
];

/** Le composant est là pour DÉMONTRER un contraste insuffisant : son aperçu ne
 * peut pas être conforme, puisqu'il affiche la paire de couleurs saisie. */
const DELIBERATE_EXCLUSIONS = [
  "[data-slot='utils-contrast-checker'] [style]",
];

const isKnownDebt = (message: string): boolean =>
  KNOWN_CONTRAST_DEBT.some(
    ({ foreground, background }) =>
      message.includes(foreground) && message.includes(background)
  );

const scan = async (page: Page) => {
  const builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);

  for (const selector of DELIBERATE_EXCLUSIONS) {
    builder.exclude(selector);
  }

  const { violations } = await builder.analyze();

  return violations.flatMap((violation) =>
    violation.nodes
      .filter(
        (node) =>
          !node.any.some((check) => isKnownDebt(check.message))
      )
      .map(
        (node) =>
          `${violation.id} · ${node.target.join(" ")} · ${node.any
            .map((check) => check.message)
            .join(" | ")}`
      )
  );
};

test.describe("accessibilité automatique", () => {
  /**
   * Un onglet fermé n'est pas rendu : le scan d'une page de composant ne voyait
   * donc jamais le bac à sable, avec ses cases à cocher et ses champs. Cet état
   * mérite le même contrôle que le reste.
   */
  test("le bac à sable ouvert est conforme", async ({ page }) => {
    await page.goto("/components/flip-sentences-component");
    await page.waitForLoadState("networkidle");
    await page.getByRole("tab", { name: "bac à sable" }).click();

    // attendre le bouton de copie, pas seulement le conteneur : le panneau est
    // visible dès qu'il entre dans le DOM, alors que le composant et le bouton
    // arrivent encore. Scanner à cet instant faisait remonter un bouton sans nom
    // qui, une fois monté, en a bien un.
    await expect(
      page.getByRole("button", {
        name: "copier le code du bac à sable",
      })
    ).toBeVisible();

    expect(await scan(page)).toEqual([]);
  });

  for (const path of PAGES) {
    test(`aucune violation axe sur ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(await scan(page), `violations axe sur ${path}`).toEqual(
        []
      );
    });
  }
});
