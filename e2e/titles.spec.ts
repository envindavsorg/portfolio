import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Les intitulés de section doivent être LISIBLES.
 *
 * Ils ne l'étaient pas : la page d'accueil affichait des bandes vides à la place
 * de plusieurs titres. Trois correctifs sont partis ensemble ; réintroduits UN
 * PAR UN sous ce test, ils ne pèsent pas du tout le même poids.
 *
 * Ce qui tient tout : la CLÉ de `TextAnimate`. Sans `key={children}`, un texte
 * qui change après la première entrée dans le cadre monte ses caractères en
 * `hidden` et plus rien ne déclenche `show`. Retirée, ce test échoue à 23/25
 * caractères invisibles, définitivement — c'est LE garde-fou.
 *
 * Les deux autres sont réels mais ne causent pas l'invisibilité durable, et ce
 * test passe sans eux. La sentinelle inversée (`isStuck = !entry.isIntersecting`,
 * alors qu'une sentinelle est hors cadre dans deux cas OPPOSÉS) faisait afficher
 * la forme « -- titre -- » à des titres encore sous la ligne de flottaison :
 * c'est ce changement de texte qui ARMAIT le défaut de clé, pas lui qui le
 * produisait. Et `once` relève de l'affichage. Corriger la cause profonde a
 * rendu les deux autres invisibles au test — les noter évite de croire qu'ils
 * sont gardés.
 *
 * Le test ne vérifie pas l'animation — il vérifie qu'aucun titre visible à
 * l'écran ne RESTE transparent. C'est la propriété qui compte : une animation
 * ratée se remarque, un titre absent laisse un trou que personne n'explique.
 *
 * ⚠️ « RESTE » se teste par une attente CONVERGENTE, pas par un délai fixe.
 *
 * La première version attendait 900 ms puis affirmait. Elle passait ici et
 * échouait en CI, en signalant « 16/40 caractères invisibles » sur un titre de
 * 16 caractères : 40 spans, c'est la copie sortante et la copie entrante
 * montées ensemble par `AnimatePresence` pendant la bascule vers la forme
 * collée. Mesuré en local, un titre est à 16/17 invisibles juste après le
 * défilement et à 0/17 dès 300 ms. Le délai fixe ne testait donc pas
 * l'invisibilité durable, il testait la VITESSE de la machine — et un runner
 * partagé est plus lent qu'un poste de travail.
 *
 * `expect.poll` dit exactement ce qu'on veut dire. Le défaut d'origine laissait
 * les titres à `opacity: 0` pour toujours : il épuise le délai et échoue,
 * pendant qu'une entrée normale converge en une fraction de seconde.
 */

/** large devant les 300 ms constatées, court devant « pour toujours » */
const SETTLE_TIMEOUT = 5000;

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

const DESCENTE = [0, 900, 1500, 2400, 3600, 4600];

/**
 * On descend ET on remonte.
 *
 * Ajouté pour garder `once`, et ça n'a PAS marché : avec `once = false` remis,
 * les deux sens passent. Motion rejoue bien `hidden` en sortie de cadre, mais
 * il rejoue aussi `show` à la rentrée, donc le titre revient — l'invisibilité
 * est passagère, et une attente convergente ne la voit pas. La note qui
 * présentait ce réglage comme un correctif d'invisibilité durable était
 * exagérée : c'est un choix d'affichage, pas une réparation.
 *
 * La remontée est gardée quand même. C'est le sens dans lequel on relit une
 * page, et l'état du DOM n'y est pas le même : les titres rentrent dans le
 * cadre sans rejouer d'animation. Une régression qui les remettrait à zéro se
 * verrait ici et nulle part ailleurs.
 */
const PARCOURS: { top: number; sens: string }[] = [
  ...DESCENTE.map((top) => ({ sens: "en descendant", top })),
  ...DESCENTE.toReversed().map((top) => ({
    sens: "en remontant",
    top,
  })),
];

test.describe("titres de section", () => {
  for (const path of ["/", "/en"]) {
    test(`aucun titre transparent en défilant ${path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 900, width: 1280 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      for (const { top, sens } of PARCOURS) {
        await page.evaluate(
          (y) => window.scrollTo({ behavior: "instant", top: y }),
          top
        );

        await expect
          .poll(() => hiddenTitles(page), {
            message: `titres transparents à ${top}px ${sens} sur ${path}`,
            timeout: SETTLE_TIMEOUT,
          })
          .toEqual([]);
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

    const stuck = page
      .locator("[data-slot='panel-header'] [data-slot='panel-title']")
      .first();
    await expect(stuck).toBeVisible();

    await expect
      .poll(() => hiddenTitles(page), {
        message:
          "titres transparents après la bascule en position collée",
        timeout: SETTLE_TIMEOUT,
      })
      .toEqual([]);
  });
});
