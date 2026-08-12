import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Une CSP ne se vérifie pas en relisant l'en-tête : il faut charger les pages
 * dans un vrai navigateur et écouter les violations. Ce test échoue si une
 * directive bloque une ressource légitime — c'est le seul garde-fou contre une
 * CSP trop stricte qui casserait le site en silence.
 */
const collectViolations = async (page: Page): Promise<string[]> => {
  const violations: string[] = [];

  await page.addInitScript(() => {
    window.addEventListener("securitypolicyviolation", (event) => {
      const detail = `${event.violatedDirective} → ${event.blockedURI}`;
      (window as unknown as { __csp: string[] }).__csp ??= [];
      (window as unknown as { __csp: string[] }).__csp.push(detail);
    });
  });

  page.on("console", (message) => {
    const text = message.text();
    if (
      message.type() === "error" &&
      text.includes("Content Security Policy")
    ) {
      violations.push(text);
    }
  });

  return violations;
};

const readReportedViolations = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __csp?: string[] }).__csp ?? []
  );

/**
 * Garde-fou contre un faux positif : une page dont les scripts ne se chargent
 * pas ne signale évidemment aucune violation. Sans cette vérification, un
 * serveur servant du HTML périmé (chunks introuvables) rendait la suite entière
 * verte alors que rien ne s'exécutait.
 */
/**
 * Les scripts Vercel Analytics et Speed Insights sont injectés par la
 * plateforme : en local ils répondent 404, ce qui est normal et sans rapport
 * avec la CSP (ils sont en même origine, donc couverts par `script-src 'self'`).
 */
const isTracked = (url: string) =>
  url.endsWith(".js") && !url.includes("/_vercel/");

const collectDeadScripts = (page: Page): string[] => {
  const dead: string[] = [];

  page.on("response", (response) => {
    const url = response.url();
    if (isTracked(url) && response.status() >= 400) {
      dead.push(`${response.status()} ${url}`);
    }
  });

  page.on("requestfailed", (request) => {
    if (isTracked(request.url())) {
      dead.push(`échec ${request.url()}`);
    }
  });

  return dead;
};

const PAGES = [
  "/",
  "/en",
  "/articles",
  "/articles/how-i-write-css",
  "/components",
  "/utils",
  "/utils/hash-generator",
  "/utils/color-generator",
  "/utils/article-banner-generator",
];

test.describe("Content-Security-Policy", () => {
  test("l'en-tête est servi et ferme les directives sensibles", async ({
    request,
  }) => {
    const response = await request.get("/");
    const csp = response.headers()["content-security-policy"];

    expect(csp).toBeTruthy();
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");

    // documenté comme contrainte du App Router, pas comme un oubli : si cette
    // assertion tombe un jour, c'est que les nonces sont devenus possibles
    expect(csp).toContain("'unsafe-inline'");
  });

  test("HSTS est servi avec une durée utile", async ({ request }) => {
    const response = await request.get("/");
    const hsts =
      response.headers()["strict-transport-security"] ?? "";

    expect(hsts).toContain("includeSubDomains");
    const maxAge = Number(/max-age=(\d+)/u.exec(hsts)?.[1] ?? 0);
    expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
  });

  for (const path of PAGES) {
    test(`aucune violation CSP sur ${path}`, async ({ page }) => {
      const consoleViolations = await collectViolations(page);
      const deadScripts = collectDeadScripts(page);

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // d'abord : la page a-t-elle vraiment exécuté son JavaScript ?
      expect(deadScripts, `scripts non chargés sur ${path}`).toEqual(
        []
      );

      const reported = await readReportedViolations(page);

      expect(
        [...consoleViolations, ...reported],
        `violations CSP sur ${path}`
      ).toEqual([]);
    });
  }
});
