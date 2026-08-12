import { expect, test } from "@playwright/test";

/**
 * Page de recherche.
 *
 * Son intérêt par rapport à la palette ⌘K est d'être partageable : la requête
 * vit dans le fragment d'URL, jamais dans un paramètre de requête, sinon la page
 * deviendrait dynamique et perdrait son prérendu. Les tests portent donc autant
 * sur l'URL que sur les résultats.
 */

const results = "[data-slot='search-results']";

test.describe("page de recherche", () => {
  test("cherche dans le contenu et pas seulement dans les titres", async ({
    page,
  }) => {
    await page.goto("/search");

    await page.getByLabel("votre recherche").fill("subgrid");

    const items = page.locator(`${results} li`);
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText(
      /comment j'écris du css/iu
    );

    // « subgrid » n'apparaît que dans le corps : le résultat doit l'annoncer
    await expect(items.first()).toContainText("contenu");
  });

  test("annonce une correspondance de titre comme telle", async ({
    page,
  }) => {
    await page.goto("/search");

    await page.getByLabel("votre recherche").fill("stack");

    const items = page.locator(`${results} li`);
    await expect(items.first()).toContainText("titre");
  });

  test("écrit la requête dans le fragment d'URL", async ({
    page,
  }) => {
    await page.goto("/search");

    await page.getByLabel("votre recherche").fill("tailwind");

    await expect.poll(() => page.url()).toContain("#q=tailwind");
    // jamais en paramètre de requête : la page doit rester statique
    expect(page.url()).not.toContain("?q=");
  });

  test("une adresse partagée rouvre la même recherche", async ({
    page,
  }) => {
    await page.goto("/search#q=subgrid");

    await expect(page.getByLabel("votre recherche")).toHaveValue(
      "subgrid"
    );
    await expect(page.locator(`${results} li`)).toHaveCount(1);
  });

  test("effacer vide le champ et le fragment", async ({ page }) => {
    await page.goto("/search#q=tailwind");
    await expect(page.getByLabel("votre recherche")).toHaveValue(
      "tailwind"
    );

    await page.getByRole("button", { name: "effacer" }).click();

    await expect(page.getByLabel("votre recherche")).toHaveValue("");
    await expect.poll(() => page.url()).not.toContain("q=");
  });

  test("annonce le nombre de résultats dans une région live", async ({
    page,
  }) => {
    await page.goto("/search");

    const status = page.getByRole("status");
    await expect(status).toContainText(/tapez quelque chose/iu);

    await page.getByLabel("votre recherche").fill("css");
    await expect(status).toContainText(/résultat\(s\)/iu);
  });

  test("le dit quand rien ne correspond", async ({ page }) => {
    await page.goto("/search");

    await page
      .getByLabel("votre recherche")
      .fill("motclequinexistenullepart");

    await expect(page.locator(`${results} li`)).toHaveCount(0);
    await expect(
      page.getByText(/aucun résultat pour/iu)
    ).toBeVisible();
  });

  test("un résultat mène au contenu", async ({ page }) => {
    await page.goto("/search#q=subgrid");

    await page.locator(`${results} li a`).first().click();

    await expect(page).toHaveURL("/articles/how-i-write-css");
  });

  test("la page existe aussi en anglais et reste dans son arbre", async ({
    page,
  }) => {
    await page.goto("/en/search#q=subgrid");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await expect(page.getByLabel("your search")).toHaveValue(
      "subgrid"
    );

    const href = await page
      .locator(`${results} li a`)
      .first()
      .getAttribute("href");
    expect(href).toBe("/en/articles/how-i-write-css");
  });

  test("la palette et la page trouvent le même contenu", async ({
    page,
  }) => {
    // les deux passent par scoreText : un classement divergent ferait de la
    // palette un raccourci qui ne raccourcit rien
    await page.goto("/search#q=subgrid");

    const links = page.locator(`${results} li a`);
    await expect(links).toHaveCount(1);
    const href = await links.first().getAttribute("href");

    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");
    await page
      .getByPlaceholder(/tapez une commande ou cherchez/iu)
      .fill("subgrid");

    // aucune entrée statique du menu ne contient « subgrid » : la palette doit
    // donc proposer exactement le même unique résultat
    const options = page.getByRole("option");
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText(
      /comment j'écris du css/iu
    );

    expect(href).toBe("/articles/how-i-write-css");
  });
});
