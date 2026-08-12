import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Les trois outils ajoutés à /utils.
 *
 * Ils calculent tous dans le navigateur, donc les valeurs attendues ci-dessous
 * sont des références calculées ailleurs (Python / crypto standard) : un test
 * qui recalculerait avec la même fonction que le code testé ne prouverait rien.
 */

/**
 * Next.js monte en permanence un `<div role="alert">` vide pour annoncer les
 * changements de route : `getByRole("alert")` en attrape donc toujours un de
 * plus. On ne cible que les messages d'erreur des outils.
 */
const errorMessages = (page: Page) => page.locator("p[role='alert']");

/** n'est rendu qu'une fois un jeton décodé */
const SIGNATURE_NOTICE = /la signature n'est pas contrôlée/u;

const HEADER = { alg: "HS256", typ: "JWT" };

// exp au 14 novembre 2023, donc dans le passé
const EXPIRED_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwfQ.dGVzdC1zaWduYXR1cmU";

// exp en 2099
const VALID_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJHcmFjZSBIb3BwZXIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6NDEwMDAwMDAwMH0.dGVzdC1zaWduYXR1cmU";

test.describe("décodeur JWT", () => {
  test("décode l'en-tête, la charge utile et la signature", async ({
    page,
  }) => {
    await page.goto("/utils/jwt-decoder");

    await page.getByLabel("jeton JWT").fill(VALID_TOKEN);

    const header = page.locator("pre").first();
    const payload = page.locator("pre").nth(1);

    await expect(header).toContainText('"alg": "HS256"');
    await expect(header).toContainText(`"typ": "${HEADER.typ}"`);
    await expect(payload).toContainText('"name": "Grace Hopper"');
    await expect(payload).toContainText('"sub": "42"');

    // la signature est affichée telle quelle, jamais vérifiée
    // `exact` : la même chaîne est présente dans le champ de saisie
    await expect(
      page.getByText("dGVzdC1zaWduYXR1cmU", { exact: true })
    ).toBeVisible();
    await expect(page.getByText(SIGNATURE_NOTICE)).toBeVisible();
  });

  test("distingue un jeton valide d'un jeton expiré", async ({
    page,
  }) => {
    await page.goto("/utils/jwt-decoder");
    const field = page.getByLabel("jeton JWT");

    await field.fill(VALID_TOKEN);
    await expect(page.getByText(/valide jusqu'au/iu)).toBeVisible();
    await expect(page.getByText(/^expiré le/iu)).toBeHidden();

    await field.fill(EXPIRED_TOKEN);
    await expect(page.getByText(/expiré le/iu)).toBeVisible();
    await expect(page.getByText(/valide jusqu'au/iu)).toBeHidden();
  });

  test("signale un jeton mal formé sans rien afficher", async ({
    page,
  }) => {
    await page.goto("/utils/jwt-decoder");

    await page.getByLabel("jeton JWT").fill("pas-un-jwt");

    await expect(errorMessages(page)).toContainText(
      /trois parties séparées/iu
    );
    // rien de décodé ne doit rester à l'écran (le corps de l'article contient
    // ses propres blocs <pre>, on s'appuie donc sur l'avertissement de signature,
    // qui n'apparaît qu'avec un jeton lisible)
    await expect(page.getByText(SIGNATURE_NOTICE)).toBeHidden();
  });

  test("signale un base64url invalide", async ({ page }) => {
    await page.goto("/utils/jwt-decoder");

    await page.getByLabel("jeton JWT").fill("@@@.@@@.@@@");

    await expect(errorMessages(page)).toContainText(
      /base64url valide|objet JSON/iu
    );
  });

  test("un champ vide n'affiche pas d'erreur", async ({ page }) => {
    await page.goto("/utils/jwt-decoder");

    const field = page.getByLabel("jeton JWT");
    await field.fill(VALID_TOKEN);
    await field.fill("");

    // une erreur « jeton malformé » sur un champ vide serait du bruit
    await expect(errorMessages(page)).toHaveCount(0);
  });
});

test.describe("empreintes et UUID", () => {
  test("calcule les empreintes de référence", async ({ page }) => {
    await page.goto("/utils/hash-generator");

    await page.getByLabel("texte à hacher").fill("bonjour");

    await expect(
      page.getByText(
        "2cb4b1431b84ec15d35ed83bb927e27e8967d75f4bcd9cc4b25c8d879ae23e18"
      )
    ).toBeVisible();

    await page.getByRole("button", { name: "SHA-1" }).click();
    await expect(
      page.getByText("1f71e0f4ac9b47cd93bf269e4017abaab9d3bd63")
    ).toBeVisible();
  });

  test("hache les octets UTF-8, pas les points de code", async ({
    page,
  }) => {
    await page.goto("/utils/hash-generator");

    await page.getByLabel("texte à hacher").fill("héllo");

    await expect(
      page.getByText(
        "3c48591d8d098a4538f5e013dfcf406e948eac4d3277b10bf614e295d6068179"
      )
    ).toBeVisible();
  });

  test("l'algorithme choisi est annoncé aux lecteurs d'écran", async ({
    page,
  }) => {
    await page.goto("/utils/hash-generator");

    const sha256 = page.getByRole("button", { name: "SHA-256" });
    const sha512 = page.getByRole("button", { name: "SHA-512" });

    await expect(sha256).toHaveAttribute("aria-pressed", "true");
    await expect(sha512).toHaveAttribute("aria-pressed", "false");

    await sha512.click();
    await expect(sha512).toHaveAttribute("aria-pressed", "true");
    await expect(sha256).toHaveAttribute("aria-pressed", "false");
  });

  test("génère cinq UUID v4 distincts", async ({ page }) => {
    await page.goto("/utils/hash-generator");

    await page.getByRole("button", { name: "générer" }).click();

    // la page contient d'autres listes (le corps MDX de l'outil) : on ne garde
    // que les lignes portant un bouton de copie d'UUID
    const items = page.getByRole("listitem").filter({
      has: page.getByRole("button", { name: "copier cet UUID" }),
    });
    await expect(items).toHaveCount(5);

    const values = await items.allInnerTexts();
    const uuids = values.map(
      (value) => value.trim().split("\n")[0] ?? ""
    );

    for (const uuid of uuids) {
      expect(uuid).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u
      );
    }
    expect(new Set(uuids).size).toBe(5);
  });

  test("vider le champ efface l'empreinte", async ({ page }) => {
    await page.goto("/utils/hash-generator");

    const field = page.getByLabel("texte à hacher");
    await field.fill("bonjour");
    await expect(
      page.getByText(
        "2cb4b1431b84ec15d35ed83bb927e27e8967d75f4bcd9cc4b25c8d879ae23e18"
      )
    ).toBeVisible();

    await field.fill("");
    // laisser une empreinte périmée à l'écran ferait croire à un calcul à jour
    await expect(
      page.getByText(
        "2cb4b1431b84ec15d35ed83bb927e27e8967d75f4bcd9cc4b25c8d879ae23e18"
      )
    ).toBeHidden();
  });
});

test.describe("comparateur de textes", () => {
  test("compte les lignes ajoutées, supprimées et inchangées", async ({
    page,
  }) => {
    await page.goto("/utils/diff-viewer");

    await page
      .getByLabel("texte original")
      .fill("un\ndeux\ntrois\nquatre");
    await page
      .getByLabel("texte modifié")
      .fill("un\ndeux-bis\ntrois\nquatre\ncinq");

    // « deux » remplacé (1 supprimée + 1 ajoutée), « cinq » ajoutée,
    // « un », « trois » et « quatre » inchangées
    await expect(
      page.getByText("2 ligne(s) ajoutée(s)")
    ).toBeVisible();
    await expect(
      page.getByText("1 ligne(s) supprimée(s)")
    ).toBeVisible();
    await expect(
      page.getByText("3 ligne(s) inchangée(s)")
    ).toBeVisible();
  });

  test("le tableau porte des repères lisibles au clavier", async ({
    page,
  }) => {
    await page.goto("/utils/diff-viewer");

    await page.getByLabel("texte original").fill("alpha\nbeta");
    await page.getByLabel("texte modifié").fill("alpha\ngamma");

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    // les signes + et - sont décoratifs : le sens passe par du texte sr-only
    await expect(table.getByText("ligne ajoutée :")).toBeVisible();
    await expect(table.getByText("ligne supprimée :")).toBeVisible();
  });

  test("tout effacer remet les deux champs à zéro", async ({
    page,
  }) => {
    await page.goto("/utils/diff-viewer");

    const left = page.getByLabel("texte original");
    const right = page.getByLabel("texte modifié");

    await left.fill("alpha");
    await right.fill("beta");
    await expect(page.getByRole("table")).toBeVisible();

    await page.getByRole("button", { name: "tout effacer" }).click();

    await expect(left).toHaveValue("");
    await expect(right).toHaveValue("");
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("deux textes identiques ne produisent aucune différence", async ({
    page,
  }) => {
    await page.goto("/utils/diff-viewer");

    await page.getByLabel("texte original").fill("alpha\nbeta");
    await page.getByLabel("texte modifié").fill("alpha\nbeta");

    await expect(
      page.getByText("0 ligne(s) ajoutée(s)")
    ).toBeVisible();
    await expect(
      page.getByText("0 ligne(s) supprimée(s)")
    ).toBeVisible();
    await expect(
      page.getByText("2 ligne(s) inchangée(s)")
    ).toBeVisible();
  });
});
