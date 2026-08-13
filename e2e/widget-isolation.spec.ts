import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Un widget d'outil ne doit pas voyager sur les pages qui ne l'utilisent pas.
 *
 * `src/components/markdown/utils-widgets.ts` existe pour cette raison : les
 * quatorze widgets étaient déclarés dans la table de composants MDX, qui est un
 * module unique partagé par TOUTES les pages de contenu. Chaque article
 * embarquait donc @cloudflare/speedtest et le générateur de bannière sur canvas.
 *
 * Rien ne gardait ce résultat. Redéclarer un widget dans la table partagée est
 * une ligne, ne casse aucun test, et regonfle silencieusement chaque page du
 * site — c'est-à-dire exactement la régression que le module a corrigée.
 *
 * Le test cherche un MARQUEUR dans le corps des scripts réellement téléchargés,
 * pas dans la sortie du build : `speed.cloudflare.com` est une chaîne littérale
 * de @cloudflare/speedtest, et sa présence dans un script prouve que la
 * bibliothèque est arrivée dans le navigateur.
 *
 * Le cas TÉMOIN est ce qui rend le test honnête : la page du test de débit doit
 * bel et bien contenir le marqueur. Sans lui, retirer la dépendance ferait
 * passer toutes les assertions « absent » pour une bonne nouvelle, alors qu'elles
 * ne vérifieraient plus rien.
 */

const MARKER = "speed.cloudflare.com";

const SANS_WIDGET = [
  "/",
  "/en",
  "/articles",
  "/articles/how-i-write-css",
  "/components",
  "/tags",
  "/search",
  "/series/parcours",
];

/** URL des scripts effectivement reçus par la page */
const collectScripts = (page: Page) => {
  const urls = new Set<string>();
  page.on("response", (response) => {
    const url = response.url();
    if (url.endsWith(".js") && !url.includes("/_vercel/")) {
      urls.add(url);
    }
  });
  return urls;
};

const findMarker = async (
  page: Page,
  urls: Set<string>
): Promise<string[]> => {
  const hits: string[] = [];

  for (const url of urls) {
    const response = await page.request.get(url);
    const body = await response.text();

    if (body.includes(MARKER)) {
      hits.push(url.split("/").pop() ?? url);
    }
  }

  return hits;
};

test.describe("isolation des widgets d'outils", () => {
  test("la page du test de débit contient bien la bibliothèque (témoin)", async ({
    page,
  }) => {
    const scripts = collectScripts(page);
    await page.goto("/utils/internet-speed-test");
    await page.waitForLoadState("networkidle");

    expect(
      await findMarker(page, scripts),
      "sans ce témoin, les assertions d'absence ne prouvent plus rien"
    ).not.toEqual([]);
  });

  for (const path of SANS_WIDGET) {
    test(`aucun widget d'outil sur ${path}`, async ({ page }) => {
      const scripts = collectScripts(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(
        await findMarker(page, scripts),
        `@cloudflare/speedtest est arrivé sur ${path}`
      ).toEqual([]);
    });
  }
});
