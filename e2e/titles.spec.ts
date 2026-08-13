import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Les intitulés de section doivent être LISIBLES.
 *
 * Ils ne l'étaient pas : la page d'accueil affichait des bandes vides à la place
 * de plusieurs titres. Le mécanisme tenait en deux défauts qui se combinaient.
 *
 * La sentinelle de collage posait `isStuck = !entry.isIntersecting`, or une
 * sentinelle est hors du cadre dans deux cas OPPOSÉS : quand on a défilé au-delà,
 * et quand on ne l'a pas encore atteinte. Tout titre sous la ligne de flottaison
 * se croyait donc collé, affichait sa forme « -- titre -- », puis changeait de
 * texte en entrant à l'écran. Et un changement de texte après la première entrée
 * dans le cadre laissait les nouveaux caractères en `hidden`, sans rien pour
 * déclencher leur apparition.
 *
 * Le test ne vérifie pas l'animation — il vérifie qu'aucun titre visible à
 * l'écran ne reste transparent. C'est la propriété qui compte : une animation
 * ratée se remarque, un titre absent laisse un trou que personne n'explique.
 */

const hiddenTitles = async (page: Page) =>
  await page.evaluate(() => {
    const titles = [
      ...document.querySelectorAll("[data-slot='panel-title']"),
    ];

    return titles
      .filter((title) => {
        const box = title.getBoundingClientRect();
        return box.top < window.innerHeight && box.bottom > 0;
      })
      .map((title) => {
        const spans = [...title.querySelectorAll("span")];
        const invisible = spans.filter(
          (span) => getComputedStyle(span).opacity === "0"
        );

        return invisible.length > 0
          ? `« ${(title.textContent ?? "").slice(0, 30)} » : ${invisible.length}/${spans.length} caractères invisibles`
          : "";
      })
      .filter(Boolean);
  });

test.describe("titres de section", () => {
  for (const path of ["/", "/en"]) {
    test(`aucun titre transparent en défilant ${path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 900, width: 1280 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      for (const top of [0, 900, 1500, 2400, 3600, 4600]) {
        await page.evaluate(
          (y) => window.scrollTo({ behavior: "instant", top: y }),
          top
        );
        // laisser l'entrée s'achever : elle dure 0,3 s plus le décalage
        await page.waitForTimeout(900);

        expect(
          await hiddenTitles(page),
          `titres transparents à ${top}px sur ${path}`
        ).toEqual([]);
      }
    });
  }

  /**
   * Le titre collé change de texte (« -- titre -- ») : c'est ce changement qui
   * cassait l'animation. Il doit rester lisible après la bascule.
   */
  test("le titre reste lisible une fois collé", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() =>
      window.scrollTo({ behavior: "instant", top: 1200 })
    );
    await page.waitForTimeout(900);

    const stuck = page
      .locator("[data-slot='panel-header'] [data-slot='panel-title']")
      .first();
    await expect(stuck).toBeVisible();
    expect(await hiddenTitles(page)).toEqual([]);
  });
});
