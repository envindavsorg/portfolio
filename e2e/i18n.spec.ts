import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// collecte les erreurs console (dont les erreurs d'hydratation React)
const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  return errors;
};

test.describe("i18n", () => {
  test("la home FR rend en français sans erreur d'hydratation", async ({
    page,
  }) => {
    const errors = collectErrors(page);

    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(
      page.getByRole("link", { name: "changer de langue" })
    ).toHaveAttribute("href", "/en");

    // laisse l'hydratation se terminer
    await page.waitForLoadState("networkidle");

    const hydrationErrors = errors.filter((e) =>
      /hydration|hydratation|didn't match/iu.test(e)
    );
    expect(hydrationErrors).toEqual([]);
  });

  test("la home EN rend en anglais sans erreur d'hydratation", async ({
    page,
  }) => {
    const errors = collectErrors(page);

    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "home" })
    ).toBeVisible();

    await page.waitForLoadState("networkidle");

    const hydrationErrors = errors.filter((e) =>
      /hydration|didn't match/iu.test(e)
    );
    expect(hydrationErrors).toEqual([]);
  });

  test("le sélecteur de langue bascule FR → EN", async ({ page }) => {
    await page.goto("/articles");
    await page
      .getByRole("link", { name: "changer de langue" })
      .click();
    await expect(page).toHaveURL("/en/articles");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("les pages outils répondent dans les deux langues", async ({
    page,
  }) => {
    await page.goto("/utils/lorem-ipsum-generator");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");

    await page.goto("/en/utils/lorem-ipsum-generator");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
