import { expect, test } from "@playwright/test";

/**
 * L'espace d'administration, vu de l'extérieur.
 *
 * Ces tests ne se connectent pas : ils vérifient qu'on NE PEUT PAS. C'est la
 * seule chose qui compte ici, et c'est vérifiable sans base ni identifiants
 * OAuth — ce qui tombe bien, la CI n'en a aucun.
 *
 * En CI, `ADMIN_GITHUB_ID` et `DATABASE_URL` sont absents : `getAdminSession`
 * rend donc `null` par la branche « non configuré ». Ces tests prouvent que
 * cette branche REDIRIGE au lieu de servir la page — l'inverse serait un espace
 * d'administration ouvert à tous sur un déploiement mal configuré.
 */

test.describe("espace d'administration", () => {
  test("une visite sans session est renvoyée vers la connexion", async ({
    page,
  }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/admin\/signin$/u);
  });

  /**
   * La page protégée ne doit RIEN laisser filtrer avant de rediriger. Un
   * tableau de bord prérendu puis masqué par une redirection côté client
   * aurait déjà livré son contenu dans le HTML.
   */
  test("le tableau de bord ne fuit pas dans le HTML servi", async ({
    request,
  }) => {
    const response = await request.get("/admin", {
      maxRedirects: 0,
    });

    // 307 ou 308 selon la façon dont Next émet la redirection de `redirect()`
    expect([307, 308]).toContain(response.status());
    expect(response.headers().location).toContain("/admin/signin");

    const html = await response.text();
    expect(html).not.toContain("tableau de bord");
    expect(html).not.toContain("signalements");
  });

  test("la page de connexion dit ce qui manque plutôt que d'échouer", async ({
    page,
  }) => {
    await page.goto("/admin/signin");

    await expect(
      page.getByRole("heading", { name: "administration" })
    ).toBeVisible();

    // en CI rien n'est configuré : on attend l'avertissement, pas le bouton
    await expect(page.getByText("n'est pas configuré")).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "se connecter avec GitHub",
      })
    ).toHaveCount(0);
  });

  test("l'endpoint d'authentification répond sans base plutôt que de tomber", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/get-session");

    // 503 « non configuré » : explicite, et surtout pas une erreur 500
    expect(response.status()).toBe(503);
  });

  test("aucune page d'administration n'est indexable", async ({
    request,
  }) => {
    const robots = await (await request.get("/robots.txt")).text();

    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /api/auth/*");

    const sitemap = await (await request.get("/sitemap.xml")).text();

    expect(sitemap).not.toContain("/admin");
  });
});
