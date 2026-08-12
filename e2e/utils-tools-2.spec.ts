import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Les cinq outils ajoutés après les trois premiers.
 *
 * Comme pour les autres, les valeurs attendues viennent de l'extérieur : la
 * formule WCAG et les prochaines exécutions cron ont été calculées en Python, pas
 * avec le code testé.
 */

/**
 * Portée d'un outil.
 *
 * Le corps MDX de la page documente l'outil, donc il contient les mêmes mots que
 * l'interface : « camelCase », « 1700000000 », « toutes les valeurs »… Sans cette
 * portée, chaque assertion attrape aussi le texte de l'article. Le `data-slot`
 * existe pour ça.
 */
const widget = (page: Page, name: string) =>
  page.locator(`[data-slot='utils-${name}']`);

const errorMessages = (page: Page, name: string) =>
  widget(page, name).locator("p[role='alert']");

test.describe("dates et horodatages", () => {
  test("convertit un horodatage en secondes", async ({ page }) => {
    await page.goto("/utils/date-converter");

    await page.getByLabel("horodatage ou date").fill("1700000000");

    // 1700000000 = 14 novembre 2023 à 22:13:20 UTC
    await expect(
      widget(page, "date-converter").getByText(
        "2023-11-14T22:13:20.000Z"
      )
    ).toBeVisible();
    await expect(
      widget(page, "date-converter").getByText("1700000000000")
    ).toBeVisible();
    await expect(
      widget(page, "date-converter").getByText(
        /horodatage unix en secondes/iu
      )
    ).toBeVisible();
  });

  test("distingue les millisecondes des secondes", async ({
    page,
  }) => {
    await page.goto("/utils/date-converter");

    const field = page.getByLabel("horodatage ou date");
    await field.fill("1700000000123");

    await expect(
      widget(page, "date-converter").getByText(
        /horodatage unix en millisecondes/iu
      )
    ).toBeVisible();
    await expect(
      widget(page, "date-converter").getByText(
        "2023-11-14T22:13:20.123Z"
      )
    ).toBeVisible();
  });

  test("lit une date ISO 8601", async ({ page }) => {
    await page.goto("/utils/date-converter");

    await page
      .getByLabel("horodatage ou date")
      .fill("2023-11-14T22:13:20Z");

    await expect(
      widget(page, "date-converter").getByText(/date iso 8601/iu)
    ).toBeVisible();
    await expect(
      widget(page, "date-converter").getByText("1700000000", {
        exact: true,
      })
    ).toBeVisible();
  });

  test("affiche l'heure de chaque fuseau", async ({ page }) => {
    await page.goto("/utils/date-converter");

    await page.getByLabel("horodatage ou date").fill("1700000000");

    // Paris est à +01:00 en novembre, Tokyo à +09:00
    await expect(
      widget(page, "date-converter").getByText("Europe/Paris")
    ).toBeVisible();
    await expect(
      widget(page, "date-converter").getByText("décalage +01:00")
    ).toBeVisible();
    await expect(
      widget(page, "date-converter").getByText("décalage +09:00")
    ).toBeVisible();
  });

  test("signale une entrée illisible", async ({ page }) => {
    await page.goto("/utils/date-converter");

    await page.getByLabel("horodatage ou date").fill("hier soir");

    await expect(errorMessages(page, "date-converter")).toContainText(
      /entrée illisible/iu
    );
  });
});

test.describe("expressions cron", () => {
  test("valide une expression et liste ses prochaines exécutions", async ({
    page,
  }) => {
    await page.goto("/utils/cron-explainer");

    const field = page.getByLabel("expression cron");
    await field.fill("*/15 * * * *");

    await expect(
      widget(page, "cron-explainer").getByText(/expression valide/iu)
    ).toBeVisible();

    // cinq exécutions, toutes à un quart d'heure rond
    const runs = widget(page, "cron-explainer").getByRole("listitem");
    await expect(runs).toHaveCount(5);

    const texts = await runs.allInnerTexts();
    for (const text of texts) {
      expect(text).toMatch(/:(00|15|30|45):00/u);
    }
  });

  test("décrit chaque champ", async ({ page }) => {
    await page.goto("/utils/cron-explainer");

    await page.getByLabel("expression cron").fill("30 9 * * *");

    await expect(
      widget(page, "cron-explainer").getByText("à 30")
    ).toBeVisible();
    await expect(
      widget(page, "cron-explainer").getByText("à 9")
    ).toBeVisible();
    await expect(
      widget(page, "cron-explainer")
        .getByText("toutes les valeurs")
        .first()
    ).toBeVisible();
  });

  test("avertit du piège jour du mois / jour de semaine", async ({
    page,
  }) => {
    await page.goto("/utils/cron-explainer");

    // les deux champs de jour sont restreints : cron déclenche dès que l'un
    // des deux correspond, ce qui surprend tout le monde
    await page.getByLabel("expression cron").fill("0 0 1 * 1");

    await expect(
      widget(page, "cron-explainer").getByText(
        /dès que l'un des deux correspond/iu
      )
    ).toBeVisible();
  });

  test("n'affiche pas l'avertissement quand un seul champ est restreint", async ({
    page,
  }) => {
    await page.goto("/utils/cron-explainer");

    await page.getByLabel("expression cron").fill("0 9 * * 1-5");

    await expect(
      widget(page, "cron-explainer").getByText(
        /dès que l'un des deux correspond/iu
      )
    ).toBeHidden();
  });

  test("signale le champ fautif", async ({ page }) => {
    await page.goto("/utils/cron-explainer");

    const field = page.getByLabel("expression cron");

    await field.fill("* * * *");
    await expect(errorMessages(page, "cron-explainer")).toContainText(
      /cinq champs sont attendus/iu
    );

    await field.fill("0 99 * * *");
    await expect(errorMessages(page, "cron-explainer")).toContainText(
      /heure/iu
    );
  });

  test("détecte une expression qui ne se déclenche jamais", async ({
    page,
  }) => {
    await page.goto("/utils/cron-explainer");
    await page.waitForLoadState("networkidle");

    // le 30 février est syntaxiquement valide et n'arrivera jamais
    await page.getByLabel("expression cron").fill("0 0 30 2 *");

    await expect(errorMessages(page, "cron-explainer")).toContainText(
      /ne se déclenchera jamais/iu
    );
  });

  test("un exemple remplit le champ", async ({ page }) => {
    await page.goto("/utils/cron-explainer");

    await widget(page, "cron-explainer")
      .getByRole("button", { name: "0 9 * * 1-5" })
      .click();

    await expect(page.getByLabel("expression cron")).toHaveValue(
      "0 9 * * 1-5"
    );
  });
});

test.describe("testeur d'expressions régulières", () => {
  test("surligne les correspondances et liste les groupes nommés", async ({
    page,
  }) => {
    await page.goto("/utils/regex-tester");

    await page
      .getByLabel("motif", { exact: true })
      .fill("(?<annee>\\d{4})-(?<mois>\\d{2})");
    await page
      .getByLabel("texte à analyser")
      .fill("2026-08 puis 2027-01");

    await expect(
      widget(page, "regex-tester").getByText("2 correspondance(s)")
    ).toBeVisible();

    const marks = widget(page, "regex-tester").locator("mark");
    await expect(marks).toHaveCount(2);
    await expect(marks.first()).toHaveText("2026-08");

    await expect(
      widget(page, "regex-tester").getByText("annee 2026")
    ).toBeVisible();
    await expect(
      widget(page, "regex-tester").getByText("mois 08")
    ).toBeVisible();
  });

  test("signale un motif invalide", async ({ page }) => {
    await page.goto("/utils/regex-tester");

    await page
      .getByLabel("motif", { exact: true })
      .fill("(non fermé");

    await expect(errorMessages(page, "regex-tester")).toContainText(
      /motif invalide/iu
    );
  });

  test("ne se bloque pas sur une correspondance vide", async ({
    page,
  }) => {
    await page.goto("/utils/regex-tester");

    await page.getByLabel("motif", { exact: true }).fill("a*");
    await page.getByLabel("texte à analyser").fill("bbb");

    // sans avancée forcée de lastIndex, la page figerait ici
    await expect(
      widget(page, "regex-tester").getByText(/correspondance\(s\)/iu)
    ).toBeVisible();
    await expect(
      widget(page, "regex-tester").locator("mark")
    ).toHaveCount(0);
  });

  test("le drapeau i change le résultat", async ({ page }) => {
    await page.goto("/utils/regex-tester");

    await page.getByLabel("motif", { exact: true }).fill("abc");
    await page.getByLabel("texte à analyser").fill("ABC abc");

    await expect(
      widget(page, "regex-tester").getByText("1 correspondance(s)")
    ).toBeVisible();

    await page
      .getByRole("button", { exact: true, name: "i" })
      .click();
    await expect(
      widget(page, "regex-tester").getByText("2 correspondance(s)")
    ).toBeVisible();
  });

  test("applique un remplacement avec groupes nommés", async ({
    page,
  }) => {
    await page.goto("/utils/regex-tester");

    await page
      .getByLabel("motif", { exact: true })
      .fill("(?<annee>\\d{4})-(?<mois>\\d{2})");
    await page.getByLabel("texte à analyser").fill("2026-08");
    await page.getByLabel("remplacement").fill("$<mois>/$<annee>");

    await expect(
      widget(page, "regex-tester").getByText("08/2026")
    ).toBeVisible();
  });
});

test.describe("contraste WCAG", () => {
  test("calcule le rapport de référence", async ({ page }) => {
    await page.goto("/utils/contrast-checker");

    await page.getByLabel("couleur du texte").fill("#000000");
    await page.getByLabel("couleur de fond").fill("#ffffff");

    // noir sur blanc : 21:1, la borne supérieure de l'échelle
    await expect(
      widget(page, "contrast-checker").getByText("21.00:1")
    ).toBeVisible();
  });

  test("distingue texte normal et texte large", async ({ page }) => {
    await page.goto("/utils/contrast-checker");

    await page.getByLabel("couleur du texte").fill("#777777");
    await page.getByLabel("couleur de fond").fill("#ffffff");

    // 4.48:1 : sous les 4.5 du texte normal, au-dessus des 3 du texte large
    await expect(
      widget(page, "contrast-checker").getByText("4.48:1")
    ).toBeVisible();

    const rows = widget(page, "contrast-checker").getByRole(
      "listitem"
    );
    // « texte normal AA » est un préfixe de « texte normal AAA » : on inclut le
    // seuil pour désigner une seule ligne
    await expect(
      rows.filter({ hasText: "texte normal AA (4.5:1)" })
    ).toContainText("non conforme");
    await expect(
      rows.filter({ hasText: "texte large AA (3:1)" })
    ).toContainText("conforme");
  });

  test("propose et applique une variante conforme", async ({
    page,
  }) => {
    await page.goto("/utils/contrast-checker");

    await page.getByLabel("couleur du texte").fill("#777777");
    await page.getByLabel("couleur de fond").fill("#ffffff");

    await expect(
      widget(page, "contrast-checker").getByText(
        /la variante la plus proche/iu
      )
    ).toBeVisible();

    await widget(page, "contrast-checker")
      .getByRole("button", { name: "appliquer" })
      .click();

    // après application, le texte normal AA doit passer
    await expect(
      widget(page, "contrast-checker")
        .getByRole("listitem")
        .filter({ hasText: "texte normal AA (4.5:1)" })
    ).toContainText("conforme");
  });

  test("inverse les deux couleurs", async ({ page }) => {
    await page.goto("/utils/contrast-checker");

    const foreground = page.getByLabel("couleur du texte");
    const background = page.getByLabel("couleur de fond");

    await foreground.fill("#123456");
    await background.fill("#abcdef");
    await widget(page, "contrast-checker")
      .getByRole("button", { name: "inverser" })
      .click();

    await expect(foreground).toHaveValue("#abcdef");
    await expect(background).toHaveValue("#123456");
  });

  test("signale une couleur illisible", async ({ page }) => {
    await page.goto("/utils/contrast-checker");

    await page.getByLabel("couleur du texte").fill("bleu marine");

    await expect(
      errorMessages(page, "contrast-checker")
    ).toContainText(/couleur illisible/iu);
  });
});

test.describe("conversion de casse", () => {
  test("produit les dix formats", async ({ page }) => {
    await page.goto("/utils/case-converter");

    await page
      .getByLabel("texte à convertir")
      .fill("Créer un élément HTML");

    await expect(
      widget(page, "case-converter").getByText("creerUnElementHtml", {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      widget(page, "case-converter").getByText("CreerUnElementHtml", {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      widget(page, "case-converter").getByText(
        "creer_un_element_html",
        { exact: true }
      )
    ).toBeVisible();
    await expect(
      widget(page, "case-converter")
        .getByText("creer-un-element-html", { exact: true })
        .first()
    ).toBeVisible();
    await expect(
      widget(page, "case-converter").getByText(
        "CREER_UN_ELEMENT_HTML",
        { exact: true }
      )
    ).toBeVisible();
  });

  test("garde les acronymes entiers", async ({ page }) => {
    await page.goto("/utils/case-converter");

    await page
      .getByLabel("texte à convertir")
      .fill("HTTPServerError");

    // et non « h_t_t_p_server_error »
    await expect(
      widget(page, "case-converter").getByText("http_server_error", {
        exact: true,
      })
    ).toBeVisible();
  });

  test("convertit chaque ligne séparément", async ({ page }) => {
    await page.goto("/utils/case-converter");

    await page
      .getByLabel("texte à convertir")
      .fill("mon champ\nautre champ");

    // une conversion sur le texte entier donnerait « monChampAutreChamp »
    await expect(
      widget(page, "case-converter").getByText(
        "monChamp\nautreChamp",
        { exact: true }
      )
    ).toBeVisible();
  });

  test("n'affiche rien pour une entrée vide", async ({ page }) => {
    await page.goto("/utils/case-converter");

    await expect(
      widget(page, "case-converter").getByText("camelCase")
    ).toBeHidden();
  });
});
