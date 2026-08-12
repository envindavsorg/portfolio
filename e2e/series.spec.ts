import { expect, test } from "@playwright/test";

/**
 * Séries.
 *
 * L'ordre de lecture d'une série n'est pas l'ordre chronologique du site : les
 * flèches ←/→ restent chronologiques, et la navigation de série est explicite.
 * Ces tests vérifient que les deux ordres coexistent sans se contredire.
 */

const PART_ONE = "/articles/how-it-started";
const PART_TWO = "/articles/my-work-journey";
const PART_THREE = "/articles/things-i-believe-in";

test.describe("panneau de série", () => {
  test("situe la partie courante dans la série", async ({ page }) => {
    await page.goto(PART_TWO);

    await expect(
      page.getByRole("heading", { name: /série : mon parcours/iu })
    ).toBeVisible();
    await expect(page.getByText("partie 2 sur 3")).toBeVisible();
    await expect(page.getByText("vous êtes ici")).toBeVisible();
  });

  test("liste les parties dans l'ordre de lecture", async ({
    page,
  }) => {
    await page.goto(PART_TWO);

    const items = page.locator("ol li").filter({
      has: page.locator("a, div"),
    });

    // l'ordre affiché suit seriesOrder, pas createdAt décroissant
    const texts = await page
      .getByRole("listitem")
      .filter({ hasText: /^[123]\./u })
      .allInnerTexts();

    expect(texts[0]).toContain("1.");
    expect(texts[1]).toContain("2.");
    expect(texts[2]).toContain("3.");
    await expect(items.first()).toBeVisible();
  });

  test("la partie courante n'est pas un lien", async ({ page }) => {
    await page.goto(PART_TWO);

    // se lier à soi-même est un arrêt de tabulation qui ne fait rien
    await expect(
      page.getByRole("link", { name: /partie 2 :/iu })
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /partie 1 :/iu })
    ).toHaveCount(1);
  });

  test("les liens précédent et suivant suivent la série", async ({
    page,
  }) => {
    await page.goto(PART_TWO);

    await page
      .getByRole("link", { name: /partie suivante/iu })
      .click();
    await expect(page).toHaveURL(PART_THREE);

    await page
      .getByRole("link", { name: /partie précédente/iu })
      .click();
    await expect(page).toHaveURL(PART_TWO);
  });

  test("pas de précédent sur la première partie", async ({
    page,
  }) => {
    await page.goto(PART_ONE);

    await expect(page.getByText("partie 1 sur 3")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /partie précédente/iu })
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /partie suivante/iu })
    ).toHaveCount(1);
  });

  test("pas de suivant sur la dernière partie", async ({ page }) => {
    await page.goto(PART_THREE);

    await expect(page.getByText("partie 3 sur 3")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /partie suivante/iu })
    ).toHaveCount(0);
  });

  test("aucun panneau sur un article hors série", async ({
    page,
  }) => {
    await page.goto("/articles/how-i-write-css");

    await expect(page.getByText(/partie \d+ sur \d+/iu)).toHaveCount(
      0
    );
  });

  test("les flèches restent chronologiques", async ({ page }) => {
    // la série va de how-it-started à things-i-believe-in ; l'ordre
    // chronologique du site est l'inverse, et c'est lui que gardent les flèches
    await page.goto(PART_TWO);
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(PART_ONE);
  });
});

test.describe("index des séries", () => {
  test("liste les séries et leurs parties", async ({ page }) => {
    await page.goto("/series");

    const link = page.getByRole("link", { name: /mon parcours/iu });
    await expect(link).toBeVisible();
    await expect(link).toContainText("3 partie(s)");

    await link.click();
    await expect(page).toHaveURL("/series/parcours");
  });

  test("la page d'une série donne l'ordre de lecture", async ({
    page,
  }) => {
    await page.goto("/series/parcours");

    const links = page.locator("a[href^='/articles/']");
    const hrefs = await links.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href") ?? "")
    );

    expect(hrefs).toEqual([PART_ONE, PART_TWO, PART_THREE]);
  });

  test("une série inconnue renvoie 404", async ({ page }) => {
    const response = await page.goto("/series/pas-une-serie");
    expect(response?.status()).toBe(404);
  });
});

test.describe("arbre anglais", () => {
  test("le libellé est traduit mais l'URL reste partagée", async ({
    page,
  }) => {
    // `series` est une clé, `seriesName` un libellé : sans cette séparation, la
    // traduction créerait une seconde série et casserait les alternates
    await page.goto("/en/articles/my-work-journey");

    await expect(
      page.getByRole("heading", { name: /series: my journey/iu })
    ).toBeVisible();
    await expect(page.getByText("part 2 of 3")).toBeVisible();

    await page.goto("/en/series/parcours");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", { name: /my journey/iu }).first()
    ).toBeVisible();
  });

  test("les deux langues se déclarent l'une l'autre", async ({
    request,
  }) => {
    const response = await request.get("/series/parcours");
    const html = await response.text();

    expect(html).toContain(
      'href="https://cuzeacflorin.fr/series/parcours"'
    );
    expect(html).toContain(
      'href="https://cuzeacflorin.fr/en/series/parcours"'
    );
  });
});
