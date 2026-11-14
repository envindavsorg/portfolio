import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Les intitulés de section doivent être LISIBLES.
 *
 * Ils ne l'étaient pas : la page d'accueil affichait des bandes vides à la place
 * de plusieurs titres. Les lettres étaient alors des composants Motion, et un
 * texte qui changeait après sa première entrée dans le cadre (« titre » devenu
 * « -- titre -- ») montait ses caractères masqués sans que rien ne les révèle.
 * Ce test a été écrit contre ce défaut : il échouait à 23/25 caractères
 * invisibles, définitivement.
 *
 * Les lettres sont aujourd'hui des `<span>` animés par des transitions CSS
 * (`PanelHeader`, `lib/sticky-title.ts`). Le défaut d'origine ne peut plus se
 * produire sous cette forme, mais son équivalent existe : une lettre n'est
 * masquée que dans trois états — titre hors écran en attente de son entrée,
 * copie qui vient d'être montée, copie qui sort — et chacun doit se terminer.
 * Un état qui ne se termine pas, c'est de nouveau un titre absent.
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
 * montées ensemble pendant la bascule vers la forme collée. Le délai fixe ne
 * testait donc pas l'invisibilité durable, il testait la VITESSE de la machine
 * — et un runner partagé est plus lent qu'un poste de travail.
 *
 * `expect.poll` dit exactement ce qu'on veut dire : un titre resté à
 * `opacity: 0` épuise le délai et échoue, pendant qu'une entrée normale
 * converge en moins d'une seconde.
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

/** les lettres des titres COLLANTS, dans l'ordre de la page */
const stickyLetters = async (page: Page) =>
  await page.evaluate(() =>
    [...document.querySelectorAll("[data-slot='panel-header']")]
      .filter(
        (header) => getComputedStyle(header).position === "sticky"
      )
      .map((header) => {
        const letters = [
          ...header.querySelectorAll(
            "[data-slot='panel-title'] span[aria-hidden]"
          ),
        ];

        return {
          below:
            header.getBoundingClientRect().top >= window.innerHeight,
          hidden: letters.filter(
            (letter) => getComputedStyle(letter).opacity === "0"
          ).length,
          letters: letters.length,
          // la ligne de temps commune est une courbe `linear()` par lettre
          timeline: letters.some((letter) =>
            getComputedStyle(
              letter
            ).transitionTimingFunction.startsWith("linear(")
          ),
          top: Math.round(
            header.getBoundingClientRect().top + window.scrollY
          ),
        };
      })
  );

test.describe("titres de section", () => {
  /**
   * Le HTML servi montre les titres : ils n'attendent pas le JavaScript.
   *
   * Motion écrivait son état de départ dans le HTML, donc les 204 lettres
   * arrivaient à `opacity: 0` et le restaient jusqu'à l'hydratation — 2,6 à
   * 2,9 s sur un profil de téléphone pour une première peinture à 0,3 s, et
   * pour toujours sans JavaScript. On coupe donc le JavaScript : ce qui est
   * lisible ici l'est avant l'hydratation.
   *
   * Seul le premier titre collant porte une entrée, jouée par le CSS dès la
   * première peinture (`eager`) : c'est le seul qui puisse tomber dans le
   * premier écran, et lui retirer son entrée serait retirer un effet.
   */
  test("les titres sont lisibles sans JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { height: 900, width: 1280 },
    });
    const page = await context.newPage();
    await page.goto("/");

    await expect
      .poll(
        async () =>
          (await stickyLetters(page)).reduce(
            (total, title) => total + title.hidden,
            0
          ),
        {
          message: "lettres de titre invisibles sans JavaScript",
          timeout: SETTLE_TIMEOUT,
        }
      )
      .toBe(0);

    const titles = await stickyLetters(page);

    // TÉMOIN : sans titre ni lettre, le zéro ci-dessus ne prouverait rien
    expect(titles.length).toBeGreaterThan(5);
    expect(titles.every((title) => title.letters > 0)).toBe(true);

    // l'entrée servie : le premier titre, et lui seul
    expect(titles.map((title) => title.timeline)).toEqual([
      true,
      ...titles.slice(1).map(() => false),
    ]);

    await context.close();
  });

  /**
   * Poser le thème ne doit pas couper une entrée en cours.
   *
   * Le fournisseur de thème désactive toutes les transitions de la page le
   * temps d'appliquer le thème, y compris au montage. Sur un écran rapide ce
   * moment tombait en pleine entrée servie, qui s'arrêtait net à mi-course. On
   * injecte ici la MÊME règle : les lettres doivent garder leur transition.
   */
  test("les lettres gardent leur transition quand le thème se pose", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.addStyleTag({
      content: "*,*::before,*::after{transition:none!important}",
    });

    const properties = await page.evaluate(() => {
      const letter = document.querySelector(
        "[data-slot='panel-header'] [data-slot='panel-title'] span[aria-hidden]"
      );
      const copy = letter?.parentElement;

      return {
        copy: copy ? getComputedStyle(copy).transitionProperty : "",
        letter: letter
          ? getComputedStyle(letter).transitionProperty
          : "",
      };
    });

    // TÉMOIN : la règle injectée coupe bien les transitions ordinaires, à
    // commencer par le fondu d'opacité de la copie qui porte les lettres
    expect(properties.copy).toBe("none");
    expect(properties.letter).toBe("opacity, translate");
  });

  /**
   * La couleur d'un titre collant ne s'anime pas et ne s'hérite pas.
   *
   * L'en-tête fondait sa couleur sur 300 ms. La couleur étant héritée, chaque
   * image de ce fondu recalculait le style de chaque lettre en mouvement : le
   * premier coût d'une bascule, donc du défilement sur téléphone. Chaque copie
   * porte maintenant sa couleur ; un fondu remis sur l'en-tête, ou une couleur
   * rendue à l'héritage, ramènerait ce coût sans rien casser de visible.
   */
  test("le titre collant porte sa couleur, sans fondu sur l'en-tête", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const headers = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "[data-slot='panel-header']"
        ),
      ]
        .filter(
          (header) => getComputedStyle(header).position === "sticky"
        )
        .map((header) => {
          const copy = header.querySelector<HTMLElement>(
            "[data-slot='panel-title'] p"
          );

          // TÉMOIN : une couleur que la copie hériterait suivrait celle-ci
          header.style.color = "rgb(1, 2, 3)";

          return {
            color: copy ? getComputedStyle(copy).color : "",
            duration: getComputedStyle(header).transitionDuration,
          };
        })
    );

    expect(headers.length).toBeGreaterThan(0);

    for (const { color, duration } of headers) {
      expect(duration).toBe("0s");
      expect(color).not.toBe("rgb(1, 2, 3)");
    }
  });

  /**
   * Servir les titres visibles ne doit pas coûter l'entrée.
   *
   * Une fois la page hydratée, un titre encore sous l'écran est masqué — personne
   * ne le regarde — et joue son entrée en arrivant dans le cadre. Sans cette
   * étape le test précédent passerait toujours, avec des titres simplement
   * posés là : c'est l'effet qui aurait disparu, en silence.
   */
  test("un titre hors écran attend d'être vu pour entrer", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect
      .poll(
        async () => {
          const below = (await stickyLetters(page)).filter(
            (title) => title.below
          );

          return (
            below.length > 0 &&
            below.every((title) => title.hidden === title.letters)
          );
        },
        {
          message:
            "les titres sous l'écran ne sont pas masqués en attendant leur entrée",
          timeout: SETTLE_TIMEOUT,
        }
      )
      .toBe(true);

    const target = (await stickyLetters(page)).findLast(
      (title) => title.below
    );
    await page.evaluate(
      (y) => window.scrollTo({ behavior: "instant", top: y }),
      (target?.top ?? 0) - 300
    );

    await expect
      .poll(() => hiddenTitles(page), {
        message: "le titre arrivé à l'écran n'est pas entré",
        timeout: SETTLE_TIMEOUT,
      })
      .toEqual([]);
  });

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
