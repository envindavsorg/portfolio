import { readFileSync } from "node:fs";

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
  urls: Set<string>,
  marker: string = MARKER
): Promise<string[]> => {
  const hits: string[] = [];

  for (const url of urls) {
    const response = await page.request.get(url);
    const body = await response.text();

    if (body.includes(marker)) {
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

/**
 * Un widget ne voyage pas non plus sur la page d'un AUTRE outil.
 *
 * Le bloc précédent ne voit que les pages sans widget, et c'est ce qui laissait
 * passer le défaut suivant : chaque page d'outil téléchargeait les quatorze
 * widgets. Ils étaient déclarés par quatorze `dynamic()` dans un module SERVEUR,
 * où un `import()` ne découpe pas le code du navigateur — les quatorze
 * références clientes partageaient la même liste de chunks, celle de la page.
 * Ils vivent maintenant derrière une frontière cliente unique
 * (`src/components/markdown/UtilWidget.tsx`), qui importe celui de la page.
 *
 * Ce bloc a échoué deux fois pendant la correction, pour deux raisons
 * différentes, et c'est ce qui dit qu'il garde quelque chose. Sur un build où
 * deux widgets étaient importés en dur dans `utils-widgets.ts` — une ligne, qui
 * ne casse rien d'autre — les quatre tests échouent et les deux témoins passent.
 * Et sur une variante où chaque widget avait son propre module asynchrone, le
 * PRÉCHARGEMENT du lien vers l'outil voisin évaluait ce module : le test de
 * débit arrivait sur la page du lorem ipsum, et nuqs sur celle du test de
 * débit. Ces deux pages sont voisines dans la liste, et c'est exprès qu'elles
 * sont toutes les deux ici.
 *
 * Deux marqueurs, chacun avec son TÉMOIN sur la page qui le charge légitimement :
 * `speed.cloudflare.com` pour le test de débit (témoin du bloc précédent) et
 * `__nuqs__`, la chaîne que l'adaptateur nuqs passe à `history.pushState`, pour
 * le générateur de lorem ipsum — le seul composant du site à lire l'URL avec
 * nuqs. La page anglaise est dans la liste : elle réutilise la vue française,
 * et rien d'autre ne le vérifie pour le poids.
 */
const NUQS_MARKER = "__nuqs__";

const ENTRE_OUTILS: { absents: [string, string][]; path: string }[] =
  [
    {
      absents: [
        ["@cloudflare/speedtest", MARKER],
        ["nuqs", NUQS_MARKER],
      ],
      path: "/utils/regex-tester",
    },
    {
      absents: [
        ["@cloudflare/speedtest", MARKER],
        ["nuqs", NUQS_MARKER],
      ],
      path: "/en/utils/regex-tester",
    },
    {
      absents: [["@cloudflare/speedtest", MARKER]],
      path: "/utils/lorem-ipsum-generator",
    },
    {
      absents: [["nuqs", NUQS_MARKER]],
      path: "/utils/internet-speed-test",
    },
  ];

test.describe("isolation entre outils", () => {
  test("la page du lorem ipsum contient bien nuqs (témoin)", async ({
    page,
  }) => {
    const scripts = collectScripts(page);
    await page.goto("/utils/lorem-ipsum-generator");
    await page.waitForLoadState("networkidle");

    expect(
      await findMarker(page, scripts, NUQS_MARKER),
      "sans ce témoin, les assertions d'absence ne prouvent plus rien"
    ).not.toEqual([]);
  });

  for (const { absents, path } of ENTRE_OUTILS) {
    test(`${path} ne charge que son propre widget`, async ({
      page,
    }) => {
      const scripts = collectScripts(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // tous les marqueurs sont cherchés avant d'affirmer : un échec nomme
      // chaque bibliothèque arrivée, pas seulement la première
      const arrived: string[] = [];
      for (const [name, marker] of absents) {
        const hits = await findMarker(page, scripts, marker);
        if (hits.length > 0) {
          arrived.push(`${name} (${hits.join(", ")})`);
        }
      }

      expect(
        arrived,
        `le widget d'un autre outil est arrivé sur ${path}`
      ).toEqual([]);
    });
  }
});

/**
 * tslog reste côté serveur.
 *
 * `src/lib/logger.ts` était importé par quatre modules qui atteignent le
 * navigateur — dont `functions.ts`, que la barre de navigation et le pied de
 * page utilisent. tslog fait référence à `Buffer`, Turbopack ajoutait donc un
 * polyfill : 86 Ko, 27 Kio gzip, dans un chunk chargé par les 47 routes, pour
 * quatre appels que `console.warn` et `console.error` remplacent.
 *
 * Même faiblesse que pour les widgets : réimporter `logger` dans un composant
 * client est une ligne, ne casse rien, et remet 27 Kio sur chaque page.
 *
 * `TslogConfigError` est le nom d'une classe d'erreur de tslog : une chaîne
 * littérale, que la minification conserve. Le TÉMOIN ne peut pas être une page —
 * aucune ne doit plus contenir tslog — il lit donc le paquet installé. Si tslog
 * renomme cette classe ou quitte les dépendances, c'est lui qui échoue, au lieu
 * de laisser les assertions d'absence passer pour une bonne nouvelle.
 */
const TSLOG_MARKER = "TslogConfigError";

const SANS_TSLOG = [
  "/",
  "/articles",
  "/articles/how-i-write-css",
  "/utils/regex-tester",
];

test.describe("tslog hors du navigateur", () => {
  test("le marqueur existe bien dans le paquet installé (témoin)", () => {
    const browserBuild = readFileSync(
      "node_modules/tslog/browser/index.js",
      "utf-8"
    );

    expect(
      browserBuild.includes(TSLOG_MARKER),
      "sans ce témoin, les assertions d'absence ne prouvent plus rien"
    ).toBe(true);
  });

  for (const path of SANS_TSLOG) {
    test(`aucune trace de tslog sur ${path}`, async ({ page }) => {
      const scripts = collectScripts(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(
        await findMarker(page, scripts, TSLOG_MARKER),
        `tslog est arrivé dans le navigateur sur ${path}`
      ).toEqual([]);
    });
  }
});
