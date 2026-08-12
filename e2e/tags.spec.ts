import { expect, test } from "@playwright/test";

/**
 * Pages de sujets.
 *
 * Le filtre des index reste côté client et ne produit aucune URL : ces pages
 * sont la seule surface indexable et partageable des tags. Les tests portent
 * donc sur ce qui doit rester vrai pour un moteur de recherche autant que pour
 * un visiteur — une URL par sujet, un lien canonique, un flux, et pas de page
 * pour un sujet inexistant.
 */

test.describe("index des sujets", () => {
  test("liste les sujets avec un lien par sujet", async ({
    page,
  }) => {
    await page.goto("/tags");

    const links = page.getByRole("link", {
      // les liens de sujet, pas ceux du fil d'Ariane ou de la navbar
      name: /\d+$/u,
    });

    const slugs = await page
      .locator("a[href^='/tags/']")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("href") ?? "")
      );

    expect(slugs.length).toBeGreaterThan(5);
    expect(new Set(slugs).size).toBe(slugs.length);
    await expect(links.first()).toBeVisible();
  });

  test("les slugs sont sans accent ni ponctuation", async ({
    page,
  }) => {
    await page.goto("/tags");

    const slugs = await page
      .locator("a[href^='/tags/']")
      .evaluateAll((nodes) =>
        nodes.map((node) =>
          (node.getAttribute("href") ?? "").replace("/tags/", "")
        )
      );

    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
    }

    // « retour d'expérience » doit survivre à la translittération
    expect(slugs).toContain("retour-d-experience");
  });
});

test.describe("page d'un sujet", () => {
  test("liste les contenus du sujet et rien d'autre", async ({
    page,
  }) => {
    await page.goto("/tags/retour-d-experience");

    const items = page.locator(
      "a[href^='/articles/'], a[href^='/components/'], a[href^='/utils/']"
    );
    const count = await items.count();
    expect(count).toBeGreaterThan(1);

    // chaque entrée pointe vers un contenu réel, pas vers un index
    for (let index = 0; index < count; index += 1) {
      const href = await items.nth(index).getAttribute("href");
      expect(href).toMatch(
        /^\/(articles|components|utils)\/[a-z0-9-]+$/u
      );
    }
  });

  test("expose un flux RSS propre au sujet", async ({
    page,
    request,
  }) => {
    await page.goto("/tags/retour-d-experience");

    const feed = page.getByRole("link", {
      name: /flux rss du sujet/iu,
    });
    await expect(feed).toHaveAttribute(
      "href",
      "/api/rss/tag/retour-d-experience"
    );

    const response = await request.get(
      "/api/rss/tag/retour-d-experience"
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(
      "application/rss+xml"
    );

    const xml = await response.text();
    expect(xml).toContain("<item>");
    // le tag voyage en <category>, apostrophe échappée comme partout ailleurs
    expect(xml).toContain(
      "<category>retour d&apos;expérience</category>"
    );
  });

  test("un sujet inconnu renvoie 404", async ({ page }) => {
    const response = await page.goto("/tags/sujet-qui-nexiste-pas");
    expect(response?.status()).toBe(404);
  });

  test("le fil d'Ariane remonte à l'index des sujets", async ({
    page,
  }) => {
    await page.goto("/tags/react");

    await page
      .getByRole("link", { name: /^tags$/iu })
      .first()
      .click();
    await expect(page).toHaveURL("/tags");
  });
});

test.describe("les tags d'un article mènent à leur sujet", () => {
  test("un article expose ses sujets en liens", async ({ page }) => {
    await page.goto("/articles/how-i-write-css");

    const heading = page.getByRole("heading", {
      name: "sujets abordés",
    });
    await expect(heading).toBeVisible();

    const link = page.getByRole("link", { name: "#tailwind" });
    await expect(link).toHaveAttribute("href", "/tags/tailwind");

    await link.click();
    await expect(page).toHaveURL("/tags/tailwind");
  });
});

test.describe("arbre anglais", () => {
  test("les pages de sujets existent aussi sous /en", async ({
    page,
  }) => {
    await page.goto("/en/tags");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto("/en/tags/react");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // les liens de contenu restent dans l'arbre anglais
    const href = await page
      .locator("a[href^='/en/components/']")
      .first()
      .getAttribute("href");
    expect(href).toMatch(/^\/en\/components\//u);
  });

  test("les deux langues se déclarent l'une l'autre", async ({
    request,
  }) => {
    const response = await request.get("/tags/react");
    const html = await response.text();

    expect(html).toContain(
      'href="https://cuzeacflorin.fr/tags/react"'
    );
    expect(html).toContain(
      'href="https://cuzeacflorin.fr/en/tags/react"'
    );
  });
});
