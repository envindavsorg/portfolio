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

interface StickyReport {
  /** en-têtes dont la forme rendue contredit la position mesurée */
  mismatches: string[];
  /** en-têtes posés sur la ligne d'accroche à cet instant */
  pinned: number;
}

/**
 * Compare, pour chaque en-tête collant, sa forme à sa position.
 *
 * La ligne d'accroche est LUE dans le style calculé (`top-14`), comme le fait
 * le composant : une valeur recopiée ici dériverait le jour où elle change.
 * Entre la ligne et deux pixels plus bas, rien n'est affirmé — c'est la marge
 * de l'observateur, et un test qui l'exigerait au pixel serait instable.
 */
const stickyReport = async (page: Page): Promise<StickyReport> =>
  await page.evaluate(() => {
    const states = [
      ...document.querySelectorAll("[data-slot='panel-header']"),
    ]
      .filter(
        (header) => getComputedStyle(header).position === "sticky"
      )
      .map((header) => {
        const line = Number.parseFloat(getComputedStyle(header).top);
        const { top } = header.getBoundingClientRect();
        const text = (
          header.querySelector("[data-slot='panel-title']")
            ?.textContent ?? ""
        ).trim();

        return {
          above: top <= line + 0.5,
          below: top >= line + 2,
          pinned: Math.abs(top - line) <= 0.5,
          stuck: text.startsWith("--"),
          text: text.slice(0, 24),
          top: Math.round(top),
        };
      });

    return {
      mismatches: states
        .filter(
          ({ above, below, stuck }) =>
            (above && !stuck) || (below && stuck)
        )
        .map(
          ({ stuck, text, top }) =>
            `« ${text} » à ${top}px : forme ${stuck ? "collée" : "au repos"}`
        ),
      pinned: states.filter(({ pinned }) => pinned).length,
    };
  });

/** un cran de molette : assez petit pour que l'ancien observateur ne voie rien */
const WHEEL_DELTA = 40;
const WHEEL_STEPS = 60;
const WHEEL_CHECK_EVERY = 5;

const WHEEL_RUNS: { delta: number; sens: string }[] = [
  { delta: WHEEL_DELTA, sens: "en descendant" },
  { delta: -WHEEL_DELTA, sens: "en remontant" },
];

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

  /**
   * La forme « -- titre -- » suit la GÉOMÉTRIE, à la molette comme au saut.
   *
   * Les tests ci-dessus se déplacent par `scrollTo` instantané, et c'est ce qui
   * cachait le défaut. L'ancien observateur ne rappelait qu'une fois, quand sa
   * sentinelle franchissait la ligne d'accroche — à un instant où sa condition
   * (`top < 0`) était encore fausse. Au défilement normal, par crans de 20 ou
   * 50 px, AUCUN titre épinglé ne prenait sa forme collée ; à 100 ou 300 px,
   * certains oui et d'autres non. Sur un parcours mixte : 269 observations
   * épinglées sur 328 sans la forme collée, et des titres restés « collés » une
   * fois revenu en haut de page. D'où des intitulés tantôt à gauche, tantôt
   * centrés, sans règle visible.
   *
   * On avance donc à la molette, par petits crans, et on compare à chaque arrêt
   * l'état rendu à la position mesurée — dans les DEUX sens : au-dessus de la
   * ligne d'accroche le titre doit être collé, en dessous il ne doit pas l'être.
   * Le second sens garde aussi le tout premier défaut, celui des titres encore
   * sous la ligne de flottaison qui se croyaient collés.
   */
  test("la forme collée suit le défilement à la molette", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.mouse.move(640, 450);

    let pinnedSeen = 0;

    for (const { delta, sens } of WHEEL_RUNS) {
      for (let step = 1; step <= WHEEL_STEPS; step++) {
        await page.mouse.wheel(0, delta);

        if (step % WHEEL_CHECK_EVERY === 0) {
          await expect
            .poll(async () => (await stickyReport(page)).mismatches, {
              message: `forme du titre contraire à sa position, ${sens}, cran ${step}`,
              timeout: SETTLE_TIMEOUT,
            })
            .toEqual([]);

          pinnedSeen += (await stickyReport(page)).pinned;
        }
      }
    }

    // TÉMOIN : sans titre réellement épinglé pendant le parcours, la boucle
    // ci-dessus ne comparerait que des titres au repos et passerait pour rien
    expect(pinnedSeen).toBeGreaterThan(0);
  });
});
