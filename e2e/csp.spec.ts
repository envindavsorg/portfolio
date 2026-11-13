import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { contrastRatio, parseColor } from "../src/lib/contrast";

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
 * Les scripts Vercel Analytics et Speed Insights sont injectés par la
 * plateforme : en local ils répondent 404, ce qui est normal et sans rapport
 * avec la CSP (ils sont en même origine, donc couverts par `script-src 'self'`).
 */
const isTracked = (url: string) =>
  url.endsWith(".js") && !url.includes("/_vercel/");

/**
 * Garde-fou contre un faux positif : une page dont les scripts ne se chargent
 * pas ne signale évidemment aucune violation. Sans cette vérification, un
 * serveur servant du HTML périmé (chunks introuvables) rendait la suite entière
 * verte alors que rien ne s'exécutait.
 */
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
  "/search",
  "/series",
  "/series/parcours",
  "/tags",
  "/tags/retour-d-experience",
  "/utils",
  "/utils/hash-generator",
  "/utils/regex-tester",
  "/utils/cron-explainer",
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

/**
 * Deux garde-fous de RENDU, rangés ici parce que ce fichier est celui qui
 * charge les pages dans un vrai navigateur pour y lire ce qu'aucune relecture
 * de code ne montre. Leur place naturelle serait `reading.spec.ts`.
 */

/**
 * Le thème du site n'est pas celui du système.
 *
 * Tailwind 4 compile `dark:` en `@media (prefers-color-scheme: dark)` tant
 * qu'aucun `@custom-variant dark` ne le rattache à la classe `.dark` posée par
 * next-themes. Les utilités suivaient donc le SYSTÈME et les jetons le SITE :
 * système clair + site sombre donnait du code `github-light` sur le canevas
 * sombre, mesuré à 1,28:1 sur 558 caractères. Rien ne le signalait — `a11y.spec`
 * tourne avec les deux réglages alignés, comme tout poste de développement.
 *
 * La couleur est lue sur chaque jeton, le fond sur le premier ancêtre qui en
 * peint un : c'est la paire réellement affichée, pas celle que le thème promet.
 */
const MISMATCHES = [
  { site: "dark", system: "light" },
  { site: "light", system: "dark" },
] as const;

const CODE_PAGES = [
  "/components/theme-switcher-component",
  "/utils/hash-generator",
];

/** WCAG 1.4.3, texte normal */
const AA_TEXT = 4.5;

const readTokenPairs = (page: Page) =>
  page.locator("[data-line] span").evaluateAll((spans) => {
    const painted = (start: Element): string => {
      for (
        let element: Element | null = start;
        element;
        element = element.parentElement
      ) {
        const { backgroundColor } = getComputedStyle(element);
        if (
          backgroundColor !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "transparent"
        ) {
          return backgroundColor;
        }
      }
      return "";
    };

    const pairs = new Map<
      string,
      { background: string; color: string; sample: string }
    >();

    for (const span of spans) {
      const sample = span.textContent?.trim() ?? "";
      if (!sample || span.children.length > 0) {
        continue;
      }
      const { color } = getComputedStyle(span);
      const background = painted(span);
      pairs.set(`${color} / ${background}`, {
        background,
        color,
        sample: sample.slice(0, 24),
      });
    }

    return [...pairs.values()];
  });

for (const { site, system } of MISMATCHES) {
  test.describe(`système ${system}, site ${site}`, () => {
    test.use({ colorScheme: system });

    for (const path of CODE_PAGES) {
      test(`le code coloré reste lisible sur ${path}`, async ({
        page,
      }) => {
        await page.addInitScript((theme) => {
          window.localStorage.setItem("theme", theme);
        }, site);

        await page.goto(path);
        await expect(page.locator("html")).toHaveClass(
          new RegExp(`\\b${site}\\b`, "u")
        );

        const pairs = await readTokenPairs(page);

        // TÉMOIN : une page sans jeton passerait la boucle sans rien mesurer
        expect(pairs.length).toBeGreaterThan(3);

        for (const { background, color, sample } of pairs) {
          const foreground = parseColor(color);
          const behind = parseColor(background);

          expect(
            foreground,
            `couleur illisible : ${color}`
          ).not.toBeNull();
          expect(
            behind,
            `fond illisible : ${background}`
          ).not.toBeNull();

          if (foreground && behind) {
            expect(
              contrastRatio(foreground, behind),
              `« ${sample} » en ${color} sur ${background}`
            ).toBeGreaterThanOrEqual(AA_TEXT);
          }
        }
      });
    }
  });
}

/**
 * La signature d'un contenu : date, temps de lecture, nombre de mots.
 *
 * Elle affichait le jeton de format lui-même — « écrit le LL », rendu « ll »
 * par le `lowercase` de la page et lu « 11 » — parce que dayjs n'avait pas le
 * plugin `localizedFormat`. Aucun test ne lisait ce texte. S'y ajoutaient
 * « 1 minutes » sur les contenus courts et, à 390px, des lignes commençant par
 * le séparateur (« · 1077 mots »).
 */
const BYLINES = [
  { path: "/articles/how-i-write-css", unit: "min" },
  { path: "/en/articles/how-i-write-css", unit: "min" },
  // 125 mots : le cas « 1 minutes »
  { path: "/components/theme-switcher-component", unit: "1 min" },
];

test.describe("signature d'un contenu", () => {
  for (const { path, unit } of BYLINES) {
    test(`une vraie date et un temps de lecture sur ${path}`, async ({
      page,
    }) => {
      await page.goto(path);

      const byline = page.locator("[data-slot='writings-byline']");
      const dates = byline.locator("time");

      await expect(dates.first()).toBeVisible();
      for (const date of await dates.all()) {
        await expect(date).toHaveText(/\b20\d{2}\b/u);
        await expect(date).not.toHaveText(/\bLL\b/iu);
      }

      await expect(byline).toContainText(
        new RegExp(`\\b${unit}\\b`, "u")
      );
      await expect(byline).not.toContainText("minutes");
    });
  }

  for (const width of [390, 320]) {
    test(`aucune ligne ne commence par un séparateur à ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 800, width });
      await page.goto("/articles/how-i-write-css");

      const byline = page.locator("[data-slot='writings-byline']");
      const first = await byline
        .locator("time")
        .first()
        .boundingBox();
      const separators = byline.locator("[aria-hidden='true']");

      // TÉMOIN : sans séparateur trouvé, la liste ci-dessous serait vide
      expect(await separators.count()).toBeGreaterThan(1);
      expect(first).not.toBeNull();

      const orphans = await separators.evaluateAll(
        (dots, lineStart) =>
          dots
            .map((dot) => dot.getBoundingClientRect().left)
            .filter((left) => left <= lineStart + 1),
        first?.x ?? 0
      );

      expect(orphans).toEqual([]);
    });
  }
});
