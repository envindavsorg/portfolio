import { expect, test } from "@playwright/test";

/**
 * Ce qui bouge — ou travaille — sans que le visiteur n'ait rien demandé, au
 * chargement. Une cause mesurée, une garde :
 *
 * - les deux sections GitHub de l'accueil sortaient du flux HTML et revenaient
 *   300 ms après la première image, en poussant tout ce qui suit.
 */

const PHONE = { height: 844, width: 390 };

/** 0,29 à 0,78 quand le saut avait lieu, 0,001 à 0,003 depuis */
const MAX_SHIFT = 0.05;

interface Probe {
  __shift?: number;
}

test.describe("sections GitHub dans le flux", () => {
  for (const path of ["/", "/en"]) {
    test(`le HTML de ${path} ne diffère aucune frontière`, async ({
      request,
    }) => {
      const html = await (await request.get(path)).text();

      const repos = html.indexOf('id="my-repos"');
      const stack = html.indexOf('id="my-stack"');

      // TÉMOIN : les deux sections sont bien servies, sinon rien n'est prouvé
      expect(repos).toBeGreaterThan(-1);
      expect(stack).toBeGreaterThan(-1);

      // à sa place dans le document, pas en fin de flux dans un bloc caché
      expect(repos).toBeLessThan(stack);
      expect(html).not.toContain("<!--$?-->");
      expect(html).not.toContain("$RC(");
    });
  }
});

test.describe("lien profond sur téléphone", () => {
  test.use({ viewport: PHONE });

  test("/#my-experiences ne saute pas", async ({ page }) => {
    await page.addInitScript(() => {
      const probe = window as unknown as Probe;
      probe.__shift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as unknown as {
            hadRecentInput: boolean;
            value: number;
          };
          if (!shift.hadRecentInput) {
            probe.__shift = (probe.__shift ?? 0) + shift.value;
          }
        }
      }).observe({ buffered: true, type: "layout-shift" });
    });

    await page.goto("/#my-experiences", { waitUntil: "load" });

    const target = page.locator("#my-experiences");
    await expect(target).toBeInViewport();
    // la révélation différée tombait 300 ms après la première image
    await page.waitForTimeout(1500);

    const shift = await page.evaluate(
      () => (window as unknown as Probe).__shift ?? 0
    );
    expect(shift).toBeLessThan(MAX_SHIFT);

    // la section visée est restée là où le navigateur a défilé
    const top = await target.evaluate(
      (element) => element.getBoundingClientRect().top
    );
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(PHONE.height / 2);
  });
});
