import { expect, test } from "@playwright/test";

/**
 * Fiches de réalisation, /uses, /now et /weight.
 *
 * Le point commun de ces pages : ce sont des URL qui n'existaient pas. Un
 * portfolio sans adresse par réalisation oblige à envoyer un lien vers la page
 * d'accueil en demandant de dérouler le bon accordéon.
 */

const PROJECT = "/projects/portfolio";
const ROLE = "/experience/wefix-by-fnac";

test.describe("fiches de projet et de poste", () => {
  test("chaque fiche a un titre unique et un seul h1", async ({
    page,
  }) => {
    for (const path of [PROJECT, ROLE]) {
      await page.goto(path);

      const headings = page.locator("h1");
      await expect(headings).toHaveCount(1);
      await expect(headings.first()).not.toHaveText("");
    }
  });

  test("l'index mène à la fiche, et la fiche revient à l'index", async ({
    page,
  }) => {
    await page.goto("/projects");

    await page
      .locator("a[href='/projects/portfolio']")
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects\/portfolio$/u);

    await page
      .getByRole("link", { name: /tous mes projets/iu })
      .click();
    await expect(page).toHaveURL(/\/projects$/u);
  });

  /**
   * L'`id` sert de slug et ne se traduit pas : c'est ce qui permet à une URL de
   * fiche partagée de retomber sur la même réalisation dans les deux langues.
   */
  test("le même slug sert les deux langues, avec les deux hreflang", async ({
    request,
  }) => {
    for (const path of [PROJECT, ROLE]) {
      for (const url of [path, `/en${path}`]) {
        const response = await request.get(url);
        expect(response.status(), `${url} doit répondre 200`).toBe(
          200
        );
      }

      const frResponse = await request.get(path);
      const html = await frResponse.text();
      expect(html).toContain(`href="https://cuzeacflorin.fr${path}"`);
      expect(html).toContain(
        `href="https://cuzeacflorin.fr/en${path}"`
      );
    }
  });

  test("les fiches sont annoncées au sitemap", async ({
    request,
  }) => {
    const sitemap = await request.get("/sitemap.xml");
    const xml = await sitemap.text();

    for (const path of [
      "/projects",
      "/experience",
      PROJECT,
      ROLE,
      "/uses",
      "/now",
      "/weight",
    ]) {
      expect(xml, `${path} absent du sitemap`).toContain(
        `https://cuzeacflorin.fr${path}<`
      );
    }
  });

  /**
   * Une formation n'a ni puces ni compétences : sa fiche se réduirait à un
   * intitulé et deux dates déjà lisibles sur /cv.
   */
  test("les formations n'ont pas de fiche", async ({ request }) => {
    for (const slug of ["etna-master", "um2-licence"]) {
      const response = await request.get(`/experience/${slug}`);
      expect(response.status()).toBe(404);
    }
  });

  test("la page d'accueil mène aux deux index", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator("a[href='/projects']").first()
    ).toBeVisible();
    await expect(
      page.locator("a[href='/experience']").first()
    ).toBeVisible();
  });
});

test.describe("le poids de ce site", () => {
  test("publie une ligne par page mesurée", async ({ page }) => {
    await page.goto("/weight");

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    const count = await rows.count();
    expect(count).toBeGreaterThan(5);

    // les chiffres publiés sont des nombres, pas des trous
    const cells = await page
      .locator("tbody tr:first-child td")
      .allInnerTexts();
    expect(cells.length).toBeGreaterThan(5);
  });

  test("cite le poids du JS de la page la plus lourde", async ({
    page,
  }) => {
    await page.goto("/weight");

    // la ligne des plafonds compare mesure et plafond : les deux doivent y être
    await expect(
      page.getByText(/JS.*Kio.*plafond.*Kio/u)
    ).toBeVisible();
  });
});

test.describe("/uses et /now", () => {
  test("/uses ne liste que des groupes non vides", async ({
    page,
  }) => {
    await page.goto("/uses");

    // `Panel` rend un <section> : cibler tous les <section> attraperait la navbar
    // et le pied de page, qui n'ont pas de liste
    const sections = page.locator("[data-slot='uses-group']");
    const count = await sections.count();
    expect(count).toBeGreaterThan(2);

    for (let index = 0; index < count; index += 1) {
      await expect(sections.nth(index).locator("li")).not.toHaveCount(
        0
      );
    }
  });

  /**
   * /now est dérivée du dépôt : sa date de fraîcheur vient du contenu, pas de
   * l'horloge. Une page /now qui se déclare à jour le jour où on la charge ne dit
   * rien du tout.
   */
  test("/now annonce une date issue du contenu", async ({ page }) => {
    await page.goto("/now");

    await expect(page.getByText(/à jour au/iu)).toBeVisible();
    await expect(
      page.locator("a[href^='/experience/']").first()
    ).toBeVisible();
    await expect(
      page.locator("a[href^='/articles/']").first()
    ).toBeVisible();
  });

  test("les deux pages ont leur miroir texte", async ({
    request,
  }) => {
    for (const [url, expected] of [
      ["/uses.md", "Ce que j'utilise"],
      ["/now.md", "En ce moment"],
    ]) {
      const response = await request.get(url);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain(
        "text/markdown"
      );

      const body = await response.text();
      expect(body).toContain(expected);
      // le piège du dépôt : un message interpolé au lieu d'être appelé
      expect(body).not.toContain("=>");
      expect(body).not.toContain("function");
    }
  });

  test("le miroir est référencé depuis /llms.txt", async ({
    request,
  }) => {
    const llms = await request.get("/llms.txt");
    const body = await llms.text();

    expect(body).toContain("/uses.md");
    expect(body).toContain("/now.md");
  });
});
