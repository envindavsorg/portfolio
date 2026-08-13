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
 * Les DEUX thèmes sont scannés. Le thème sombre est resté longtemps hors de
 * portée : axe rapportait un fond blanc sur un document portant la classe
 * `dark`. La cause était que ni html ni body ne peignaient de background-color —
 * le fond venait du canevas de l'agent utilisateur, qui n'est pas un style
 * calculé. Depuis que body peint `--canvas`, la mesure est fiable.
 */

const PAGES = [
  "/",
  "/en",
  "/cv",
  "/en/cv",
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

/** Le composant est là pour DÉMONTRER un contraste insuffisant : son aperçu ne
 * peut pas être conforme, puisqu'il affiche la paire de couleurs saisie. */
const DELIBERATE_EXCLUSIONS = [
  "[data-slot='utils-contrast-checker'] [style]",
];

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

  /**
   * Plus aucune dette n'est tolérée.
   *
   * Les deux entrées listées ici sont fermées : la couleur de marque est passée
   * de 4,4995:1 à 4,5102:1, et le jeton orange du thème Shiki est relevé au
   * build par `rehype-shiki-contrast`. TOUTE violation de contraste fait donc
   * échouer ce test, sans exception à lire.
   */
  return violations.flatMap((violation) =>
    violation.nodes.map(
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

/**
 * Le thème sombre, enfin scannable.
 *
 * Les tentatives précédentes donnaient des mesures qu'axe ne pouvait pas
 * résoudre : il rapportait un fond BLANC alors que le document portait la classe
 * `dark`. La cause vient d'être trouvée — ni html ni body ne peignaient de
 * background-color, le fond venait du canevas de l'agent utilisateur via
 * `color-scheme`, et un canevas n'est pas un style calculé. Maintenant que body
 * peint `--canvas`, `colorScheme: "dark"` suffit : next-themes est en
 * `defaultTheme: system`, donc la préférence émulée pilote réellement le thème.
 *
 * La liste est plus courte que celle du thème clair : ce sont les pages où la
 * couleur porte de l'information, pas les 16 types de pages.
 */
test.describe("accessibilité en thème sombre", () => {
  test.use({ colorScheme: "dark" });

  for (const path of [
    "/",
    "/articles",
    "/articles/how-i-write-css",
    "/tags",
    "/utils/contrast-checker",
    "/search",
    "/en",
  ]) {
    test(`aucune violation axe sur ${path} en sombre`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // garde-fou sur la garde : si le document ne bascule pas réellement en
      // sombre, le test scannerait le thème clair une seconde fois et passerait
      // au vert sans rien vérifier de neuf
      await expect(page.locator("html")).toHaveClass(/dark/u);

      expect(
        await scan(page),
        `violations axe en sombre sur ${path}`
      ).toEqual([]);
    });
  }
});
