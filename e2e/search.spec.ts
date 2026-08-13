import { expect, test } from "@playwright/test";

/**
 * La palette ⌘K.
 *
 * L'enjeu du test n'est pas qu'elle s'ouvre — c'est qu'elle cherche dans le
 * CONTENU et pas seulement dans les titres. « subgrid » n'apparaît que dans le
 * corps de l'article sur le CSS : si le filtre retombait sur celui de cmdk
 * (comparaison du seul `value`, donc du titre), la recherche ne renverrait rien
 * et le test échouerait.
 */
const CSS_ARTICLE = /comment j'écris du css/iu;
const OTHER_ARTICLE = /comment tout a commencé/iu;
const PLACEHOLDER = /tapez une commande ou cherchez/iu;

test.describe("palette ⌘K", () => {
  test("s'ouvre au raccourci clavier et se ferme avec Échap", async ({
    page,
  }) => {
    await page.goto("/");

    const input = page.getByPlaceholder(PLACEHOLDER);
    await expect(input).toBeHidden();

    await page.keyboard.press("ControlOrMeta+k");
    await expect(input).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(input).toBeHidden();

    // le focus doit revenir sur le déclencheur, sinon la tabulation repart du
    // début du document
    await expect(
      page.getByRole("button", { name: "rechercher" })
    ).toBeFocused();
  });

  test("s'ouvre aussi avec la touche /", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("/");
    await expect(page.getByPlaceholder(PLACEHOLDER)).toBeVisible();
  });

  test("le raccourci est neutralisé dans un champ de saisie", async ({
    page,
  }) => {
    await page.goto("/utils/hash-generator");

    const field = page.getByLabel("texte à hacher");
    await field.click();
    await field.press("/");

    await expect(page.getByPlaceholder(PLACEHOLDER)).toBeHidden();
    await expect(field).toHaveValue("/");
  });

  test("trouve un article par un mot présent seulement dans son corps", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");

    await page.getByPlaceholder(PLACEHOLDER).fill("subgrid");

    await expect(
      page.getByRole("option", { name: CSS_ARTICLE })
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: OTHER_ARTICLE })
    ).toBeHidden();
  });

  test("ignore les accents dans la requête", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");

    // le titre s'écrit « Comment j'écris du CSS » : sans normalisation, taper
    // « ecris » sans accent ne le trouverait pas
    await page.getByPlaceholder(PLACEHOLDER).fill("ecris");

    await expect(
      page.getByRole("option", { name: CSS_ARTICLE })
    ).toBeVisible();
  });

  test("Entrée ouvre le résultat sélectionné", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");

    await page.getByPlaceholder(PLACEHOLDER).fill("subgrid");
    await expect(
      page.getByRole("option", { name: CSS_ARTICLE })
    ).toBeVisible();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/articles/how-i-write-css");
  });

  test("sur /en la palette cherche dans l'index anglais", async ({
    page,
  }) => {
    await page.goto("/en");
    await page.keyboard.press("ControlOrMeta+k");

    const input = page.getByPlaceholder(/type a command or search/iu);
    await expect(input).toBeVisible();
    await input.fill("subgrid");

    const result = page.getByRole("option", {
      name: /how i write css/iu,
    });
    await expect(result).toBeVisible();
    await page.keyboard.press("Enter");

    // et la navigation reste dans l'arbre anglais
    await expect(page).toHaveURL("/en/articles/how-i-write-css");
  });
});

/**
 * Le mode COMMANDE de la palette.
 *
 * `kind: "command"` était déclaré dans types.ts et son libellé traduit dans les
 * deux locales, mais aucun item ne s'en servait : la palette ne savait que
 * naviguer. Ces items s'exécutent au lieu d'aller quelque part.
 */
test.describe("palette ⌘K : actions", () => {
  test("bascule le thème sans changer de page", async ({ page }) => {
    await page.goto("/articles");
    await page.waitForLoadState("networkidle");

    const before = await page.locator("html").getAttribute("class");

    await page.keyboard.press("ControlOrMeta+k");
    await page.getByPlaceholder(/./u).fill("thème");
    await page.keyboard.press("Enter");

    // le thème change ET l'adresse ne bouge pas : une action n'est pas un lien
    await expect
      .poll(() => page.locator("html").getAttribute("class"))
      .not.toBe(before);
    await expect(page).toHaveURL("/articles");
  });

  test("change de langue en restant sur la même page", async ({
    page,
  }) => {
    await page.goto("/articles");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("ControlOrMeta+k");
    await page.getByPlaceholder(/./u).fill("langue");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/en/articles");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("la touche ? ouvre la feuille de raccourcis", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("?");

    const sheet = page.locator('[data-slot="shortcuts-sheet"]');
    await expect(sheet).toBeVisible();

    // les cinq raccourcis du site étaient documentés nulle part : alt+D bascule
    // le thème depuis toujours et n'apparaissait dans aucune interface
    await expect(
      sheet.getByText("alt", { exact: true })
    ).toBeVisible();
    await expect(sheet.locator("kbd")).not.toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("le raccourci ? est neutre dans un champ de saisie", async ({
    page,
  }) => {
    await page.goto("/utils/hash-generator");
    await page.waitForLoadState("networkidle");

    const field = page.getByLabel("texte à hacher");
    await field.fill("a?b");

    // sinon taper un point d'interrogation ouvrirait l'aide au lieu d'écrire
    await expect(field).toHaveValue("a?b");
    await expect(
      page.locator('[data-slot="shortcuts-sheet"]')
    ).toBeHidden();
  });
});
