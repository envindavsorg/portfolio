import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Le formulaire de demande de CV.
 *
 * C'est le seul schéma Zod qui s'exécute dans le navigateur, et rien ne
 * l'ouvrait : fermée, la modale n'est pas dans le DOM (zéro `<form>` sur « / »,
 * un seul une fois ouverte). Aucun scan de la page ne voyait donc ni ses
 * messages, ni ce que la validation fait à la CSP au moment où elle tourne.
 *
 * Ce test ne soumet JAMAIS une saisie valide. L'action serveur envoie un vrai
 * e-mail dès qu'une clé Resend est présente : en CI il n'y en a pas, sur le poste
 * de quelqu'un il peut y en avoir une.
 */

type Locale = "en" | "fr";

type MessageKey =
  | "form_email_invalid"
  | "form_first_name_required"
  | "form_first_name_too_long"
  | "form_first_name_too_short"
  | "home_cv_form_email_label"
  | "home_cv_form_firstname_label"
  | "home_cv_form_submit_button"
  | "home_cv_modal_trigger_button";

// lus à la source des traductions, comme dans emailSchema.test.ts : un libellé
// corrigé depuis /admin ne doit pas faire tomber ce test
const read = (locale: Locale): Record<MessageKey, string> =>
  JSON.parse(
    readFileSync(
      join(process.cwd(), `messages/${locale}.json`),
      "utf8"
    )
  );

const TREES: { locale: Locale; path: string }[] = [
  { locale: "fr", path: "/" },
  { locale: "en", path: "/en" },
];

const watchCsp = async (page: Page) => {
  await page.addInitScript(() => {
    const store = window as unknown as { __csp?: string[] };
    store.__csp = [];
    window.addEventListener("securitypolicyviolation", (event) => {
      store.__csp?.push(
        `${event.violatedDirective} → ${event.blockedURI}`
      );
    });
  });

  return () =>
    page.evaluate(
      () => (window as unknown as { __csp?: string[] }).__csp ?? []
    );
};

test.describe("formulaire de demande de CV", () => {
  for (const { locale, path } of TREES) {
    test(`valide dans la langue de ${path}, sans violation CSP`, async ({
      page,
    }) => {
      const messages = read(locale);
      const readViolations = await watchCsp(page);

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // la section CV est rendue deux fois sur la page d'accueil, en haut et
      // en bas : `.first()` n'est pas une approximation, c'est un choix
      await page
        .getByRole("button", {
          exact: true,
          name: messages.home_cv_modal_trigger_button,
        })
        .first()
        .click();

      const dialog = page.getByRole("dialog");
      const firstName = dialog.getByLabel(
        messages.home_cv_form_firstname_label
      );
      const email = dialog.getByLabel(
        messages.home_cv_form_email_label
      );
      // `p[role="alert"]` : Next monte toujours un `<div role="alert">` vide
      const alerts = dialog.locator('p[role="alert"]');

      await expect(firstName).toBeVisible();

      await dialog
        .getByRole("button", {
          exact: true,
          name: messages.home_cv_form_submit_button,
        })
        .click();

      // un prénom vide échoue à deux contrôles : c'est « requis » qui s'affiche
      await expect(alerts).toHaveText([
        messages.form_first_name_required,
        messages.form_email_invalid,
      ]);
      await expect(firstName).toHaveAttribute("aria-invalid", "true");
      await expect(email).toHaveAttribute("aria-invalid", "true");

      await firstName.fill("A");
      await expect(alerts.first()).toHaveText(
        messages.form_first_name_too_short
      );

      await firstName.fill("abcdefghijklmnopqrstu");
      await expect(alerts.first()).toHaveText(
        messages.form_first_name_too_long
      );

      await firstName.fill("Florin");
      await email.fill("florin@");
      await expect(alerts).toHaveText([messages.form_email_invalid]);
      await expect(firstName).toHaveAttribute(
        "aria-invalid",
        "false"
      );

      await email.fill("florin@example.com");
      await expect(alerts).toHaveCount(0);

      // la validation a tourné à chaque saisie : c'est ici qu'une sonde
      // `new Function` se verrait, pas au chargement de la page
      expect(await readViolations()).toEqual([]);
    });
  }
});

/**
 * Zod entier ne doit pas revenir dans le navigateur.
 *
 * Le formulaire importait l'objet `z` : 74 Kio de plus sur la page d'accueil,
 * dont les messages d'une soixantaine de langues, pour deux champs. Le
 * réimporter est une ligne, ne casse aucun test, et le plafond de
 * `budget.spec.ts` est assez haut pour ne rien dire.
 *
 * Même méthode que `widget-isolation.spec.ts` : un MARQUEUR cherché dans les
 * scripts réellement reçus. Celui-ci est un mot de la traduction allemande de
 * Zod, qui n'arrive que lorsque l'objet `z` voyage en entier.
 */
const MARKER = "Kreditkartennummer";

test.describe("Zod dans le navigateur", () => {
  // le témoin : aucune page du site ne livre Zod entier, il se lit donc dans
  // le paquet lui-même. Si Zod reformule ce mot, c'est ce test qui tombe — pas
  // les assertions d'absence qui deviennent vertes pour rien.
  test("le marqueur existe bien dans le paquet (témoin)", () => {
    const german = readFileSync(
      join(process.cwd(), "node_modules/zod/v4/locales/de.js"),
      "utf8"
    );

    expect(german).toContain(MARKER);
  });

  for (const { path } of TREES) {
    test(`les traductions de Zod n'arrivent pas sur ${path}`, async ({
      page,
    }) => {
      const scripts = new Set<string>();
      page.on("response", (response) => {
        const url = response.url();
        if (url.endsWith(".js") && !url.includes("/_vercel/")) {
          scripts.add(url);
        }
      });

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // sans quoi une page dont les scripts n'ont pas chargé passerait
      expect(scripts.size).toBeGreaterThan(0);

      const carriers: string[] = [];
      for (const url of scripts) {
        const body = await (await page.request.get(url)).text();
        if (body.includes(MARKER)) {
          carriers.push(url.split("/").pop() ?? url);
        }
      }

      expect(carriers, `Zod entier est arrivé sur ${path}`).toEqual(
        []
      );
    });
  }
});
