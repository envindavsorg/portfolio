import { readFileSync } from "node:fs";

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

type Locale = "fr" | "en";

/**
 * Les erreurs d'hydratation, telles qu'un build de PRODUCTION les signale.
 *
 * React y remonte un écart par `reportError`, donc par l'événement
 * `pageerror`, avec un message minifié : « Minified React error #418 ».
 * L'ancien filtre, `/hydration|didn't match/`, ne reconnaissait que la
 * formulation du mode développement : /en a levé #418 à chaque chargement
 * sans que ce fichier ne bouge.
 *
 * Toute `pageerror` fait donc échouer, quelle qu'elle soit. La console, elle,
 * reste filtrée : hors Vercel les scripts d'analytics répondent 404 sur
 * chaque page, ce qui n'a rien à voir avec le rendu.
 */
const HYDRATION =
  /hydrat|didn't match|Minified React error #(?:418|423|425)/iu;

const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      HYDRATION.test(message.text())
    ) {
      errors.push(`console : ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`pageerror : ${error.message}`);
  });
  return errors;
};

// un représentant par type de page, en plus des deux pages d'accueil
const PAGES = [
  "/cv",
  "/articles",
  "/articles/my-stack",
  "/components/theme-switcher-component",
  "/utils/lorem-ipsum-generator",
  "/projects",
  "/search",
];

const readMessages = (locale: Locale): Record<string, string> => {
  const parsed: Record<string, string> = JSON.parse(
    readFileSync(`messages/${locale}.json`, "utf-8")
  );
  return parsed;
};

const MESSAGES: Record<Locale, Record<string, string>> = {
  en: readMessages("en"),
  fr: readMessages("fr"),
};

const message = (locale: Locale, key: string): string => {
  const value = MESSAGES[locale][key];
  if (!value) {
    throw new Error(`messages/${locale}.json n'a plus la clé ${key}`);
  }
  return value;
};

/**
 * Des libellés que seuls des composants CLIENT rendent, par type de page.
 *
 * Ce sont eux qui sortaient en français sous /en : leur rendu serveur lit la
 * locale dans un exemplaire du runtime Paraglide distinct de celui des Server
 * Components, et rien d'autre dans la page ne trahit qu'il s'est trompé. Les
 * clés sont lues dans `messages/` : reformuler un libellé ne casse pas le
 * test, le supprimer si.
 */
const CLIENT_LABELS: { keys: string[]; path: string }[] = [
  {
    keys: [
      "home_cv_view_button",
      "home_about_expand_button",
      "copy_button_default_aria",
    ],
    path: "/",
  },
  {
    keys: [
      "writings_toc_trigger_label",
      "writings_actions_copy_markdown_aria",
    ],
    path: "/articles/my-stack",
  },
  {
    keys: ["utils_lorem_output_label"],
    path: "/utils/lorem-ipsum-generator",
  },
];

// `/en` et non `/en/` pour la page d'accueil
const englishPath = (path: string): string =>
  path === "/" ? "/en" : `/en${path}`;

// le balisage seul : le flux RSC en ligne répète les props, pas le rendu
const withoutScripts = (html: string): string =>
  html.replaceAll(/<script\b[\s\S]*?<\/script>/gu, "");

test.describe("i18n", () => {
  test("la home FR rend en français sans erreur d'hydratation", async ({
    page,
  }) => {
    const errors = collectErrors(page);

    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(
      page.getByRole("link", { name: "changer de langue" })
    ).toHaveAttribute("href", "/en");

    // laisse l'hydratation se terminer
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  test("la home EN rend en anglais sans erreur d'hydratation", async ({
    page,
  }) => {
    const errors = collectErrors(page);

    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "home" })
    ).toBeVisible();

    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  for (const path of PAGES) {
    test(`${path} s'hydrate sans erreur dans les deux langues`, async ({
      page,
    }) => {
      const errors = collectErrors(page);

      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        "fr"
      );
      await page.waitForLoadState("networkidle");

      await page.goto(englishPath(path));
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        "en"
      );
      await page.waitForLoadState("networkidle");

      expect(errors).toEqual([]);
    });
  }

  for (const { keys, path } of CLIENT_LABELS) {
    test(`le HTML servi pour ${englishPath(path)} n'a aucun libellé client en français`, async ({
      request,
    }) => {
      const [french, english] = await Promise.all(
        [path, englishPath(path)].map(async (url) => {
          const response = await request.get(url);
          expect(response.status()).toBe(200);
          return withoutScripts(await response.text());
        })
      );

      // des booléens et non `toContain` : un échec imprimerait les 200 Ko
      // de la page au lieu de la clé fautive
      const found = keys.map((key) => ({
        englishInEnglishPage: english.includes(message("en", key)),
        frenchInEnglishPage: english.includes(message("fr", key)),
        // TÉMOIN : le libellé français est bien dans le HTML français. Sans
        // lui, un libellé que le serveur ne rend plus du tout laisserait
        // `frenchInEnglishPage` à false pour de mauvaises raisons
        frenchInFrenchPage: french.includes(message("fr", key)),
        key,
      }));

      expect(found).toEqual(
        keys.map((key) => ({
          englishInEnglishPage: true,
          frenchInEnglishPage: false,
          frenchInFrenchPage: true,
          key,
        }))
      );
    });
  }

  test("le sélecteur de langue bascule FR → EN", async ({ page }) => {
    await page.goto("/articles");
    await page
      .getByRole("link", { name: "changer de langue" })
      .click();
    await expect(page).toHaveURL("/en/articles");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  // après hydratation, la locale du navigateur est celle de l'URL : si elle
  // retombait sur le français, le sélecteur de /en pointerait vers /en
  test("le sélecteur de langue bascule EN → FR", async ({ page }) => {
    await page.goto("/en/articles");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "switch language" }).click();
    await expect(page).toHaveURL("/articles");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("les pages outils répondent dans les deux langues", async ({
    page,
  }) => {
    await page.goto("/utils/lorem-ipsum-generator");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");

    await page.goto("/en/utils/lorem-ipsum-generator");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
