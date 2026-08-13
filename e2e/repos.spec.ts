import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Cartes de dépôts GitHub.
 *
 * Ces tests sont écrits pour être vrais DANS LES DEUX ÉTATS de la section, et
 * c'est délibéré. L'intégration continue construit le site avec un jeton GitHub
 * factice : elle ne voit donc jamais les cartes, seulement le repli. Un test qui
 * exigerait les cartes échouerait en intégration ; un test qui exigerait le
 * repli échouerait sur une machine correctement configurée. Aucun des deux ne
 * dirait quoi que ce soit d'utile.
 *
 * Ce qui est vérifié ici est donc l'INVARIANT : la section existe toujours,
 * porte toujours son lien vers le profil, et affiche exactement UN des deux
 * états — jamais les deux, jamais aucun. C'est précisément la propriété qui
 * manquait quand la section pouvait s'effacer et laisser deux séparateurs collés
 * l'un à l'autre.
 *
 * La branche « cartes » n'est donc pas du code mort non exécuté : elle a été
 * jouée en remplaçant temporairement les dépôts de repli par un jeu d'essai
 * (un dépôt étoilé avec sujets, un dépôt archivé sans description, un fork), ce
 * qui a validé l'ordre, l'exclusion du fork, les dates localisées, l'absence de
 * compteur à zéro, et un scan axe sans violation sur la grille. Reproduire cette
 * vérification demande seulement de rendre `FALLBACK.repositories` non vide dans
 * `src/actions/data.action.ts`.
 *
 * Le contenu des cartes, lui, est vérifié là où il est décidé :
 * `src/lib/repos.test.ts`.
 */

const CARDS = "[data-slot='repo-cards']";
const UNAVAILABLE = "[data-slot='repos-unavailable']";

const gotoSection = async (page: Page, path: string) => {
  await page.goto(path);
  return page.locator("#my-repos");
};

for (const { locale, path, profile, title } of [
  {
    locale: "fr",
    path: "/",
    profile: "tous mes dépôts",
    title: "mes dépôts publics",
  },
  {
    locale: "en",
    path: "/en",
    profile: "all my repositories",
    title: "my public repositories",
  },
]) {
  test.describe(`section dépôts (${locale})`, () => {
    test("porte son titre et son lien vers le profil", async ({
      page,
    }) => {
      const section = await gotoSection(page, path);

      await expect(
        section.getByRole("heading", { name: title })
      ).toBeVisible();

      const link = section.getByRole("link", { name: profile });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute(
        "href",
        /^https:\/\/github\.com\//u
      );
    });

    test("affiche exactement un des deux états", async ({ page }) => {
      const section = await gotoSection(page, path);

      const cards = section.locator(CARDS);
      const unavailable = section.locator(UNAVAILABLE);

      const cardsCount = await cards.count();
      const unavailableCount = await unavailable.count();

      // ni les deux, ni aucun : la somme vaut toujours un
      expect(
        cardsCount + unavailableCount,
        `cartes=${cardsCount} repli=${unavailableCount}`
      ).toBe(1);

      if (unavailableCount === 1) {
        await expect(unavailable).toBeVisible();
        // un repli muet serait exactement le trou qu'il doit éviter
        await expect(unavailable).toHaveText(/\S/u);
        return;
      }

      // état nominal : chaque carte porte un titre de niveau 3 qui est un lien
      // vers GitHub, et aucun compteur à zéro
      const items = cards.locator("> li");
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(6);

      for (let index = 0; index < count; index += 1) {
        const card = items.nth(index);
        const heading = card.locator("h3 a");

        await expect(heading).toHaveAttribute(
          "href",
          /^https:\/\/github\.com\//u
        );
        await expect(heading).toHaveAttribute("target", "_blank");
        await expect(heading).toHaveText(/\S/u);
      }

      // « 0 étoile » sur six cartes est du bruit : le compteur ne s'affiche
      // qu'au-delà de zéro
      await expect(
        cards.getByText(/\b0 (étoiles?|stars?|forks?)\b/u)
      ).toHaveCount(0);
    });
  });
}

test("les cartes n'ajoutent aucun script à la page d'accueil", async ({
  page,
}) => {
  // la section est entièrement rendue côté serveur : aucun état, aucun
  // gestionnaire. Une carte qui deviendrait cliente passerait inaperçue
  // autrement, et le budget JS de la page d'accueil est déjà mesuré ailleurs.
  await page.goto("/");

  const interactive = await page
    .locator("#my-repos")
    .locator("button, input, [role='button']")
    .count();

  expect(interactive).toBe(0);
});
