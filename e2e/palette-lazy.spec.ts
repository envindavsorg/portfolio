import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * La palette ⌘K arrive à la demande.
 *
 * Le bouton et l'écoute du clavier restent dans le JavaScript de la barre ; le
 * panneau (cmdk, le classement, le dialogue ou le tiroir, la feuille des
 * raccourcis) vient par un `import()` écrit dans `NavBarCommand.tsx`. Il
 * pesait de 13 à 53 Kio de JavaScript selon la page (mesure d'un build local),
 * sur chaque page, pour une palette que la plupart des visites n'ouvrent pas.
 *
 * Rien d'autre ne garde ce résultat : importer `NavBarCommandPanel` en dur est
 * une ligne, ne casse aucun test de la palette, et regonfle chaque page. Le
 * premier bloc cherche donc deux MARQUEURS dans les scripts réellement
 * téléchargés au chargement — `command-dialog-content`, une chaîne du panneau,
 * et `cmdk-input`, une chaîne de cmdk — avec un TÉMOIN : les mêmes marqueurs
 * arrivent bien dès que la palette s'ouvre. Sans lui, renommer l'attribut
 * ferait passer toutes les absences pour une bonne nouvelle.
 *
 * Les blocs suivants tiennent ce que le chargement à la demande pouvait
 * casser : un ⌘K appuyé avant l'arrivée du panneau est tenu, pas perdu ; un
 * second appui ne l'annule pas ; un import qui échoue ne laisse ni erreur ni
 * palette à moitié demandée, et l'essai suivant refait la demande.
 *
 * Deux builds volontairement cassés disent ce que ce fichier garde. Avec le
 * panneau importé en dur, le témoin et les quatre absences échouent. Avec un
 * ⌘K qui bascule au lieu de confirmer et une promesse rejetée gardée, les
 * tests « tenu » et « import qui échoue » échouent, et eux seuls.
 *
 * Le service worker est bloqué : une requête qu'il sert échappe à
 * `page.route`, et ces tests retardent ou coupent un chunk précis.
 */

test.use({ serviceWorkers: "block" });

const PANEL_MARKER = "command-dialog-content";
const CMDK_MARKER = "cmdk-input";

const PLACEHOLDER = /tapez une commande ou cherchez/iu;
const CSS_ARTICLE = /comment j'écris du css/iu;
const HINT = /glissez vers le bas/iu;
const SHORTCUTS_SHEET = /raccourcis clavier/iu;

const SANS_PANNEAU = [
  "/",
  "/articles",
  "/articles/how-i-write-css",
  "/utils/regex-tester",
];

/** URL des scripts effectivement reçus par la page */
const collectScripts = (page: Page): Set<string> => {
  const urls = new Set<string>();
  page.on("response", (response) => {
    const url = response.url();
    if (url.endsWith(".js") && !url.includes("/_vercel/")) {
      urls.add(url);
    }
  });
  return urls;
};

const scriptsContaining = async (
  page: Page,
  urls: Iterable<string>,
  marker: string
): Promise<string[]> => {
  const hits: string[] = [];

  for (const url of urls) {
    const response = await page.request.get(url);
    const body = await response.text();

    if (body.includes(marker)) {
      hits.push(url);
    }
  }

  return hits;
};

/**
 * Ouvre la palette une première fois et rend le chemin du chunk du panneau :
 * celui des scripts arrivés APRÈS le chargement qui porte le marqueur. Les
 * tests qui le retardent ou le coupent rechargent ensuite la page.
 */
const findPanelChunk = async (page: Page): Promise<string> => {
  const scripts = collectScripts(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const atLoad = new Set(scripts);

  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByPlaceholder(PLACEHOLDER)).toBeVisible();

  const onDemand = [...scripts].filter((url) => !atLoad.has(url));
  const [chunk] = await scriptsContaining(
    page,
    onDemand,
    PANEL_MARKER
  );

  expect(
    chunk,
    "aucun script arrivé à l'ouverture ne porte le marqueur du panneau"
  ).toBeDefined();

  return new URL(chunk).pathname;
};

test.describe("le panneau de la palette ne voyage pas au chargement", () => {
  test("il arrive bien à l'ouverture (témoin)", async ({ page }) => {
    const scripts = collectScripts(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const atLoad = new Set(scripts);

    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.getByPlaceholder(PLACEHOLDER)).toBeVisible();

    const onDemand = [...scripts].filter((url) => !atLoad.has(url));

    for (const marker of [PANEL_MARKER, CMDK_MARKER]) {
      expect(
        await scriptsContaining(page, onDemand, marker),
        `sans ce témoin, l'absence de « ${marker} » ne prouve plus rien`
      ).not.toEqual([]);
    }
  });

  for (const path of SANS_PANNEAU) {
    test(`ni panneau ni cmdk au chargement de ${path}`, async ({
      page,
    }) => {
      const scripts = collectScripts(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      for (const marker of [PANEL_MARKER, CMDK_MARKER]) {
        expect(
          await scriptsContaining(page, scripts, marker),
          `« ${marker} » est arrivé sur ${path} sans que la palette soit demandée`
        ).toEqual([]);
      }
    });
  }
});

test.describe("la palette à la demande s'ouvre comme avant", () => {
  test("⌘K juste après le chargement ouvre la palette, et la frappe y arrive", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");

    const input = page.getByPlaceholder(PLACEHOLDER);
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    // au clavier et non par `fill`, qui poserait lui-même le focus : le
    // panneau est monté déjà ouvert, ce que l'ancienne palette ne faisait
    // jamais
    await page.keyboard.type("subgrid");
    await expect(
      page.getByRole("option", { name: CSS_ARTICLE })
    ).toBeVisible();
  });

  test("un ⌘K appuyé avant l'arrivée du panneau est tenu, et un second ne l'annule pas", async ({
    page,
  }) => {
    const panelChunk = await findPanelChunk(page);

    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      (url) => url.pathname === panelChunk,
      async (route) => {
        await gate;
        await route.continue();
      }
    );

    await page.goto("/");
    // le nombre d'appuis ENTENDUS doit être exactement deux : un appui parti
    // avant la fin de l'hydratation n'a personne pour l'entendre, et trois
    // appuis en bascule rouvriraient la palette
    await page.waitForLoadState("networkidle");

    const input = page.getByPlaceholder(PLACEHOLDER);
    const requested = page.waitForRequest(
      (request) => new URL(request.url()).pathname === panelChunk
    );

    await page.keyboard.press("ControlOrMeta+k");
    await requested;
    // en bascule, ce second appui refermait une palette pas encore affichée
    await page.keyboard.press("ControlOrMeta+k");
    await expect(input).toBeHidden();

    release();

    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await page.keyboard.type("subgrid");
    await expect(
      page.getByRole("option", { name: CSS_ARTICLE })
    ).toBeVisible();
  });

  test("ce qui est tapé pendant l'attente du panneau arrive dans le champ", async ({
    page,
  }) => {
    const panelChunk = await findPanelChunk(page);

    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      (url) => url.pathname === panelChunk,
      async (route) => {
        await gate;
        await route.continue();
      }
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const input = page.getByPlaceholder(PLACEHOLDER);
    const requested = page.waitForRequest(
      (request) => new URL(request.url()).pathname === panelChunk
    );

    await page.keyboard.press("ControlOrMeta+k");
    await requested;
    // sur une connexion lente la recherche est tapée avant que le panneau
    // n'arrive : sans mémoire, « tailwind » ouvrait la palette sur « wind »
    await page.keyboard.type("subgridx");
    await page.keyboard.press("Backspace");
    await expect(input).toBeHidden();

    release();

    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("subgrid");
    await expect(
      page.getByRole("option", { name: CSS_ARTICLE })
    ).toBeVisible();
  });

  test("Échap abandonne un ⌘K tenu : la palette ne s'ouvre pas après coup", async ({
    page,
  }) => {
    const panelChunk = await findPanelChunk(page);

    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      (url) => url.pathname === panelChunk,
      async (route) => {
        await gate;
        await route.continue();
      }
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const input = page.getByPlaceholder(PLACEHOLDER);
    const sheet = page
      .getByRole("dialog")
      .filter({ hasText: SHORTCUTS_SHEET });
    const requested = page.waitForRequest(
      (request) => new URL(request.url()).pathname === panelChunk
    );

    await page.keyboard.press("ControlOrMeta+k");
    await requested;
    await page.keyboard.press("Escape");
    // TÉMOIN de l'arrivée du panneau : « ? » est tenu à son tour, et la
    // feuille ne peut s'afficher qu'une fois le panneau monté. Sans ce repère,
    // « la palette est cachée » serait vrai avant même que le chunk arrive.
    await page.keyboard.press("?");

    release();

    await expect(sheet).toBeVisible();
    await expect(input).toBeHidden();

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();

    // la demande abandonnée n'a rien cassé : le panneau est là, ⌘K l'ouvre
    await page.keyboard.press("ControlOrMeta+k");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test("sous 768px, ⌘K ouvre le tiroir, la frappe y arrive et Échap rend le focus", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");

    const input = page.getByPlaceholder(PLACEHOLDER);
    await expect(input).toBeVisible();
    await expect(page.locator("[data-vaul-drawer]")).toBeVisible();
    await expect(input).toBeFocused();

    await page.keyboard.type("subgrid");
    await expect(
      page.getByRole("option", { name: CSS_ARTICLE })
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(input).toBeHidden();
    await expect(
      page.getByRole("button", { name: "rechercher" })
    ).toBeFocused();
  });
});

test.describe("un import du panneau qui échoue", () => {
  test("ne laisse ni erreur ni demande en suspens, et l'essai suivant ouvre la palette", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.addEventListener("unhandledrejection", (event) => {
        const store = window as unknown as {
          __rejections?: string[];
        };
        store.__rejections ??= [];
        store.__rejections.push(String(event.reason));
      });
    });

    const panelChunk = await findPanelChunk(page);

    // le chunk est coupé tant que `failing` est vrai, donc AUSSI pour le
    // second essai que le runtime de Turbopack fait de lui-même : couper une
    // seule requête ne ferait échouer aucun import. La coupure attend le feu
    // vert du test, pour que le toast d'aide ait le temps d'être vu.
    let failing = true;
    let aborted = 0;
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      (url) => url.pathname === panelChunk,
      async (route) => {
        if (!failing) {
          await route.continue();
          return;
        }
        await gate;
        aborted += 1;
        await route.abort();
      }
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const input = page.getByPlaceholder(PLACEHOLDER);
    const hint = page.getByText(HINT);

    // au clic, la palette pose un toast à durée infinie : c'est le seul signe
    // visible d'une ouverture demandée dont le panneau n'est pas là
    await page.getByRole("button", { name: "rechercher" }).click();
    await expect(hint).toBeVisible();

    release();

    // la demande est abandonnée, et son toast avec elle : sans cela il
    // restait affiché pour toujours au-dessus d'une palette jamais venue
    await expect(hint).toBeHidden({ timeout: 10_000 });
    expect(aborted).toBeGreaterThan(0);
    await expect(input).toBeHidden();

    failing = false;

    await page.keyboard.press("ControlOrMeta+k");
    await expect(input).toBeVisible();
    await page.keyboard.type("subgrid");
    await expect(
      page.getByRole("option", { name: CSS_ARTICLE })
    ).toBeVisible();

    const rejections = await page.evaluate(
      () =>
        (window as unknown as { __rejections?: string[] })
          .__rejections ?? []
    );

    expect(rejections, "rejet de promesse non géré").toEqual([]);
    expect(errors, "erreur de page").toEqual([]);
  });
});
