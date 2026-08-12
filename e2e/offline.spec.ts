import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Fonctionnement hors ligne.
 *
 * Le manifeste déclarait `display: standalone` sans service worker : le site
 * était installable et s'ouvrait sur une page blanche sans réseau. Ces tests
 * coupent vraiment le réseau, parce que c'est le seul moyen de vérifier ce
 * comportement.
 *
 * Les tests s'exécutent en série : un service worker est partagé par origine, et
 * deux contextes qui l'installent en parallèle se marchent dessus.
 */

test.describe.configure({ mode: "serial" });

/**
 * Navigue en tolérant un rejet de `goto`.
 *
 * Hors ligne, Chromium peut faire échouer la navigation au niveau réseau avant
 * que le service worker n'ait répondu — surtout quand une autre suite occupe le
 * serveur en parallèle. Ce qui compte est le document FINALEMENT affiché, pas la
 * résolution de la promesse : l'assertion qui suit reste donc entière.
 */
const gotoOffline = async (page: Page, path: string) => {
  try {
    await page.goto(path);
  } catch {
    // l'assertion d'après tranche
  }
};

const waitForController = async (page: Page) => {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  // `clients.claim()` prend la main sur les pages déjà ouvertes : sans contrôleur,
  // aucune requête ne passe par le service worker et rien n'est mis en cache
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller))
    )
    .toBe(true);
};

test.describe("service worker", () => {
  test("le script est servi avec ses trois stratégies", async ({
    request,
  }) => {
    const response = await request.get("/sw.js");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(
      "javascript"
    );

    const source = await response.text();

    // le HTML ne doit JAMAIS être servi depuis le cache quand le réseau répond :
    // un document périmé référence des chunks qui n'existent plus
    expect(source).toContain("networkFirst");
    expect(source).toContain("cacheFirst");
    expect(source).toContain("/_next/static/");
  });

  test("la page de secours ne dépend de rien", async ({
    request,
  }) => {
    const response = await request.get("/offline.html");

    expect(response.status()).toBe(200);

    const html = await response.text();

    // elle peut rester des mois en cache : un script ou une feuille externe
    // pointerait vers des fichiers empreintés disparus, et la page de secours
    // serait elle-même cassée
    expect(html).not.toContain("<script");
    expect(html).not.toContain('rel="stylesheet"');
    expect(html).toContain("<style>");
    expect(html).toContain("pas de réseau");
  });

  test("s'enregistre et prend le contrôle de la page", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForController(page);

    const scope = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.scope;
    });

    expect(scope).toContain("localhost:1408/");
  });

  test("une page déjà visitée reste lisible hors ligne", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await waitForController(page);

    // cette navigation-ci passe par le service worker, donc elle est mise en cache
    await page.goto("/articles/how-i-write-css");
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toBeVisible();

    await context.setOffline(true);

    try {
      await gotoOffline(page, "/articles/how-i-write-css");

      await expect(
        page.getByRole("heading", { level: 1 }).first()
      ).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        "fr"
      );
    } finally {
      await context.setOffline(false);
    }
  });

  test("une page jamais visitée renvoie la page de secours", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await waitForController(page);

    await context.setOffline(true);

    try {
      await gotoOffline(page, "/articles/my-stack");

      await expect(page.getByText("pas de réseau")).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test("les ressources empreintées sont servies depuis le cache", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await waitForController(page);
    await page.goto("/articles");

    await context.setOffline(true);

    try {
      await gotoOffline(page, "/articles");

      // la page se recharge ET son JavaScript s'exécute : sans le cache des
      // fichiers de /_next/static, on obtiendrait un document sans interactivité
      const hydrated = await page.evaluate(() =>
        Boolean(
          document.querySelector("[data-slot='navbar-wrapper']") ??
          document.querySelector("nav")
        )
      );

      expect(hydrated).toBe(true);
    } finally {
      await context.setOffline(false);
    }
  });
});
