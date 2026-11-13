import type { Page, Response } from "@playwright/test";
import { expect, test } from "@playwright/test";

import type { WeightMetric } from "../src/data/weights";
import {
  LOGGED_PAGES,
  MEASURED_PAGES,
  WEIGHT_BUDGETS,
  WEIGHT_METRICS,
} from "../src/data/weights";

/**
 * Budgets de poids.
 *
 * Mesurés dans un vrai navigateur, sur ce que la page demande RÉELLEMENT — et
 * non sur la sortie du build. Le chiffre affiché par `next build` agrège des
 * chunks partagés qui ne sont pas tous téléchargés, et n'a donc pas de rapport
 * direct avec ce que reçoit un visiteur.
 *
 * Les plafonds sont des GARDE-FOUS, pas des objectifs atteints : un plafond
 * franchi est un signal à examiner, pas un feu vert pour l'élargir. Ils vivent
 * désormais dans `src/data/weights.ts`, avec les valeurs mesurées que publie la
 * page /weight.
 *
 * Tailles encodées (donc compressées), telles qu'elles passent sur le réseau.
 */

/**
 * Le service worker est BLOQUÉ dans ce fichier, et c'est ce qui rend la mesure
 * vraie.
 *
 * `public/sw.js` prend la main pendant le chargement (`clients.claim()`) et sert
 * lui-même `/_next/static/**`. Pour une réponse passée par lui, Playwright
 * rapporte une taille NÉGATIVE (environ −1 Kio) : le chunk n'était pas ignoré,
 * il était soustrait. Relevé du 13 novembre, même build, même machine, avec
 * puis sans service worker : /articles annonçait 390 Kio de JS pour 582 reçus
 * — dix-sept scripts servis par lui, tous comptés en négatif — et
 * /utils/regex-tester 509 pour 718.
 *
 * Combien de chunks arrivaient après l'activation dépendait de la vitesse de la
 * machine. C'est l'explication retenue pour l'écart entre le poste et la CI,
 * que `weights.ts` attribuait au préchargement des liens : aucun des deux
 * environnements ne mesurait le site, chacun mesurait l'instant où le service
 * worker s'activait. La prochaine trace CI dira si elle tient.
 *
 * Bloqué, le navigateur se comporte comme à une PREMIÈRE visite. C'est le cas à
 * budgéter — celui où rien n'est en cache — et `offline.spec.ts` n'est pas
 * touché : `test.use` ne vaut que pour ce fichier.
 */
test.use({ serviceWorkers: "block" });

const KIB = 1024;

/**
 * Les plafonds viennent de `src/data/weights.ts`, la même source que la page
 * /weight.
 *
 * Ils vivaient ici en constantes locales, à côté des valeurs mesurées recopiées
 * dans un commentaire. Deux endroits pour un même chiffre : la page publiait donc
 * un poids que ce test ne vérifiait pas, et rien n'aurait signalé qu'ils avaient
 * cessé de parler du même site.
 */
const budget = (metric: WeightMetric) => WEIGHT_BUDGETS[metric] * KIB;

const JS_BUDGET = budget("js");
const FONT_BUDGET = budget("fonts");
const CSS_BUDGET = budget("css");
const IMAGE_BUDGET = budget("images");
const DOCUMENT_BUDGET = budget("document");

interface Weights {
  css: number;
  document: number;
  fonts: number;
  images: number;
  js: number;
  /**
   * Charges RSC des liens visibles (`?_rsc=`). Elles ne tombaient dans AUCUNE
   * catégorie : ni script, ni document. Journalisées d'abord, sans plafond —
   * on ne borne pas un chiffre qu'on n'a encore jamais vu en CI.
   */
  prefetch: number;
}

type Bucket = keyof Weights;

interface Measure {
  /** réponses dont la taille n'a pas pu être lue : le total serait faux */
  blind: string[];
  /** attend que plus aucune requête ne soit en cours, ni ne vienne de finir */
  quiet: () => Promise<void>;
  /** attend que chaque taille ait été lue, puis rend les totaux */
  settle: () => Promise<Weights>;
}

/** même seuil que le `networkidle` de Playwright */
const QUIET_MS = 500;

const FONT_EXTENSION = /\.(?:woff2?|ttf|otf)(?:\?|$)/u;
const IMAGE_EXTENSION = /\.(?:png|jpe?g|webp|avif|gif|svg)(?:\?|$)/u;

/** l'optimiseur ne met pas d'extension : /_next/image?url=…&w=…&q=… */
const OPTIMIZED_IMAGE = "/_next/image";

const toKib = (bytes: number) => Math.round(bytes / KIB);

const RSC_PREFETCH = "_rsc=";

const bucketOf = (response: Response): Bucket | null => {
  const url = response.url();

  if (url.includes(RSC_PREFETCH)) {
    return "prefetch";
  }
  if (url.endsWith(".js")) {
    return "js";
  }
  if (url.endsWith(".css")) {
    return "css";
  }
  if (FONT_EXTENSION.test(url)) {
    return "fonts";
  }
  if (url.includes(OPTIMIZED_IMAGE) || IMAGE_EXTENSION.test(url)) {
    return "images";
  }
  if (response.request().resourceType() === "document") {
    return "document";
  }

  return null;
};

/**
 * Additionne le poids par type de ressource.
 *
 * Les scripts /_vercel/* sont exclus : ils sont injectés par la plateforme et
 * répondent 404 hors production, leur poids local ne veut donc rien dire.
 *
 * Deux défauts de la première version sont corrigés ici. Les tailles étaient
 * lues dans un gestionnaire asynchrone que personne n'attendait : le total
 * était relevé pendant que certaines lectures couraient encore. Et une taille
 * négative était additionnée telle quelle — c'est ainsi que le service worker a
 * pu fausser le chiffre sans qu'aucun test ne bronche. Une réponse sans taille
 * lisible est désormais mise de côté et fait ÉCHOUER la mesure : mieux vaut un
 * test rouge qu'un chiffre faux publié.
 */
const measure = (page: Page): Measure => {
  const weights: Weights = {
    css: 0,
    document: 0,
    fonts: 0,
    images: 0,
    js: 0,
    prefetch: 0,
  };
  const blind: string[] = [];
  const pending: Promise<void>[] = [];

  let inFlight = 0;
  let lastActivity = Date.now();
  const settled = () => {
    inFlight -= 1;
    lastActivity = Date.now();
  };

  page.on("request", () => {
    inFlight += 1;
    lastActivity = Date.now();
  });
  page.on("requestfinished", settled);
  page.on("requestfailed", settled);

  const record = async (response: Response) => {
    const url = response.url();
    if (url.includes("/_vercel/")) {
      return;
    }

    let bytes = 0;
    try {
      const sizes = await response.request().sizes();
      bytes = sizes.responseBodySize;
    } catch {
      // la requête peut avoir été annulée : elle ne compte pas
      return;
    }

    const bucket = bucketOf(response);
    if (bucket === null) {
      return;
    }

    if (bytes < 0) {
      blind.push(url);
      return;
    }

    weights[bucket] += bytes;
  };

  page.on("response", (response) => {
    pending.push(record(response));
  });

  return {
    blind,
    quiet: async () => {
      await expect
        .poll(
          () =>
            inFlight <= 0 && Date.now() - lastActivity >= QUIET_MS,
          { message: "le réseau ne se calme pas", timeout: 15_000 }
        )
        .toBe(true);
    },
    settle: async () => {
      await Promise.all(pending);
      return weights;
    },
  };
};

/**
 * Attend le fond de particules, quand la machine le charge.
 *
 * `Particles.tsx` importe tsParticles UNE SECONDE après le montage, et seulement
 * au-delà de deux cœurs. Selon la page, `networkidle` tombait avant ou après :
 * 36 Kio comptés ou non, au hasard — et jamais sur un runner à deux cœurs. La mesure l'attend donc explicitement, et la ligne
 * `POIDS` dit s'il est dans le total : deux traces ne se comparent que si elles
 * s'accordent là-dessus.
 *
 * Le canevas présent ne suffit pas : le moteur charge encore ses propres chunks
 * en s'initialisant. Et rappeler `waitForLoadState("networkidle")` n'attend
 * RIEN — l'état est déjà atteint pour ce document, l'appel rend la main
 * aussitôt. La première version de cette attente perdait ainsi 4 à 33 Kio
 * selon la page ; c'est `quiet()`, appelé ensuite, qui attend vraiment.
 */
const waitForBackdrop = async (page: Page): Promise<boolean> => {
  const eligible = await page.evaluate(
    () =>
      (navigator.hardwareConcurrency ?? 2) > 2 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  if (!eligible) {
    return false;
  }

  try {
    await page
      .locator("#tsparticles")
      .first()
      .waitFor({ state: "attached", timeout: 5000 });
  } catch {
    // page sans fond animé : la ligne POIDS le dira
    return false;
  }

  return true;
};

/** charge la page, attend tout ce qu'une première visite télécharge, et mesure */
const weigh = async (page: Page, path: string) => {
  const measured = measure(page);

  await page.goto(path);
  await page.waitForLoadState("networkidle");
  const backdrop = await waitForBackdrop(page);
  await measured.quiet();
  const weights = await measured.settle();

  /**
   * La mesure est JOURNALISÉE, pas seulement comparée.
   *
   * Les plafonds ont été posés sur des mesures locales, faute de connaître
   * celles de l'intégration continue : sans trace, resserrer davantage
   * revenait à parier sur un environnement qu'on ne voit pas. La ligne
   * ci-dessous met ces chiffres dans le journal de chaque exécution, ce qui
   * transforme la prochaine en mesure de référence.
   */
  console.log(
    `POIDS ${path} js=${toKib(weights.js)} fonts=${toKib(
      weights.fonts
    )} css=${toKib(weights.css)} images=${toKib(
      weights.images
    )} document=${toKib(weights.document)} prefetch=${toKib(
      weights.prefetch
    )} particules=${backdrop ? "oui" : "non"}`
  );

  expect(
    measured.blind,
    `réponses sans taille lisible sur ${path} : le total serait faux`
  ).toEqual([]);

  return weights;
};

/**
 * La liste vient elle aussi de `src/data/weights.ts` : la page /weight et ce test
 * parcourent donc exactement le même ensemble. Une page publiée mais jamais
 * mesurée, ou mesurée mais jamais publiée, n'est plus possible.
 */
const PAGES = MEASURED_PAGES.map((page) => page.path);

test.describe("budget de poids", () => {
  for (const path of PAGES) {
    test(`${path} reste dans son budget`, async ({ page }) => {
      const weights = await weigh(page, path);

      // message explicite : un budget dépassé doit dire de combien, sinon la
      // première réaction est d'élargir le plafond au hasard
      expect(
        weights.js,
        `JS sur ${path} : ${toKib(weights.js)} ko pour ${toKib(
          JS_BUDGET
        )} ko de budget`
      ).toBeLessThanOrEqual(JS_BUDGET);

      expect(
        weights.fonts,
        `polices sur ${path} : ${toKib(weights.fonts)} ko pour ${toKib(
          FONT_BUDGET
        )} ko de budget`
      ).toBeLessThanOrEqual(FONT_BUDGET);

      expect(
        weights.css,
        `CSS sur ${path} : ${toKib(weights.css)} ko pour ${toKib(
          CSS_BUDGET
        )} ko de budget`
      ).toBeLessThanOrEqual(CSS_BUDGET);

      expect(
        weights.images,
        `images sur ${path} : ${toKib(weights.images)} ko pour ${toKib(
          IMAGE_BUDGET
        )} ko de budget`
      ).toBeLessThanOrEqual(IMAGE_BUDGET);

      expect(
        weights.document,
        `document sur ${path} : ${toKib(
          weights.document
        )} ko pour ${toKib(DOCUMENT_BUDGET)} ko de budget`
      ).toBeLessThanOrEqual(DOCUMENT_BUDGET);
    });
  }

  /**
   * Pages mesurées et journalisées, pas encore gardées.
   *
   * Elles n'ont jamais eu de chiffre en CI, et un chiffre publié vient d'une
   * trace CI : il faut donc qu'elles y passent une fois avant d'entrer dans
   * `MEASURED_PAGES`. Aucun plafond ici — seule la lisibilité de la mesure est
   * vérifiée, par `weigh`.
   */
  for (const path of LOGGED_PAGES) {
    test(`${path} est journalisée`, async ({ page }) => {
      await weigh(page, path);
    });
  }

  test("le nombre de polices préchargées reste bas", async ({
    page,
  }) => {
    await page.goto("/");

    // deux préchargements : Pixel Square, la police de l'interface, et Geist
    // Mono. Les quatre autres fontes pixel ne servent qu'à un effet, et Geist
    // Sans n'est dessinée que sur une page d'outil : toutes portent
    // preload: false. Une régression ici coûte 70 à 100 ko sur CHAQUE page —
    // c'est arrivé deux fois, d'où ce test. Le plafond était à trois : il aurait
    // laissé Geist Sans revenir sans rien dire.
    const preloads = await page
      .locator('link[rel="preload"][as="font"]')
      .count();

    expect(preloads).toBeLessThanOrEqual(2);
  });
});

/**
 * Aucune image ne doit contourner l'optimiseur.
 *
 * Les vignettes de /articles ont été servies en 6016 px bruts, sans srcset,
 * parce qu'un composant rendait un `<img>` au lieu d'un next/image. Rien ne
 * pouvait le signaler : le poids d'image n'était mesuré nulle part, et un
 * `<img>` est parfaitement valide.
 *
 * Les bannières animées des démos du registre sont la seule exception assumée —
 * l'optimiseur rendrait une image FIXE d'un fichier animé, remplaçant la démo
 * par sa première image.
 */
test.describe("aucune image hors de l'optimiseur", () => {
  const ANIMATED_DEMOS = "-demo/";

  for (const path of ["/", "/articles", "/tags", "/en/articles"]) {
    test(`${path} ne sert aucune image brute`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const raw = await page
        .locator('img[src^="/images/"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("src") ?? "")
        );

      const unexpected = raw.filter(
        (src) => !src.includes(ANIMATED_DEMOS)
      );

      expect(
        unexpected,
        `images servies hors de l'optimiseur sur ${path}`
      ).toEqual([]);
    });
  }

  /**
   * Le srcset, vérifié dans le DOM et non dans le HTML.
   *
   * React 19 sérialise l'attribut en `srcSet` (camelCase, écrit verbatim : sa
   * table de renommage ne couvre que class, http-equiv et consorts). Un
   * `grep srcset` sur le HTML construit renvoie donc ZÉRO alors que l'attribut
   * est bien là — j'ai moi-même conclu à tort à un srcset manquant sur cette
   * base. Une assertion DOM est immunisée : le parseur HTML normalise la casse.
   */
  test("les vignettes proposent bien plusieurs tailles", async ({
    page,
  }) => {
    await page.goto("/articles");
    await page.waitForLoadState("networkidle");

    const candidates = await page
      .locator('img[data-slot="dialog-image"]')
      .evaluateAll((nodes) =>
        nodes.map(
          (node) =>
            (node.getAttribute("srcset") ?? "")
              .split(",")
              .filter(Boolean).length
        )
      );

    expect(candidates.length).toBeGreaterThan(0);

    // une vignette sans srcset est servie en pleine résolution : c'est la
    // régression qui a coûté 881 Kio sur cette page
    for (const count of candidates) {
      expect(count).toBeGreaterThanOrEqual(8);
    }
  });
});

/**
 * Cohérence de ce qui est PUBLIÉ.
 *
 * La page /weight annonce des chiffres. Rien ne garantissait qu'ils soient
 * cohérents avec les plafonds qu'ils côtoient, ni que les pages citées existent
 * encore : une entrée recopiée à la main peut annoncer 400 Kio sur une URL
 * supprimée depuis, et la page continuerait de l'afficher.
 */
test.describe("chiffres publiés", () => {
  test("aucune valeur publiée ne dépasse son plafond", () => {
    const offenders = MEASURED_PAGES.flatMap((page) =>
      WEIGHT_METRICS.filter(
        (metric) => page[metric] > WEIGHT_BUDGETS[metric]
      ).map(
        (metric) =>
          `${page.path} · ${metric} ${page[metric]} > ${WEIGHT_BUDGETS[metric]}`
      )
    );

    expect(offenders).toEqual([]);
  });

  test("les pages citées répondent toutes 200", async ({
    request,
  }) => {
    const broken: string[] = [];

    for (const page of MEASURED_PAGES) {
      const response = await request.get(page.path);
      if (response.status() !== 200) {
        broken.push(`${page.path} → ${response.status()}`);
      }
    }

    expect(broken).toEqual([]);
  });
});
