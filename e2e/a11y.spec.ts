import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Scan d'accessibilité automatique (axe-core), règles WCAG 2.0 et 2.1 niveaux A
 * et AA.
 *
 * Beaucoup d'accessibilité a été corrigée à la main sur ce site ; rien
 * n'empêchait une régression. Ce scan ne remplace pas une vérification manuelle —
 * il attrape la moitié mécanique du problème (contrastes, noms accessibles,
 * rôles, ordre des titres) et laisse le reste au jugement.
 *
 * Les DEUX thèmes sont scannés. Le thème sombre est resté longtemps hors de
 * portée : axe rapportait un fond blanc sur un document portant la classe
 * `dark`. La cause était que ni html ni body ne peignaient de background-color —
 * le fond venait du canevas de l'agent utilisateur, qui n'est pas un style
 * calculé. Depuis que body peint `--canvas`, la mesure est fiable.
 */

const PAGES = [
  "/",
  "/en",
  "/cv",
  "/en/cv",
  "/articles",
  "/articles/how-i-write-css",
  "/components",
  "/components/theme-switcher-component",
  "/components/flip-sentences-component",
  "/utils",
  "/utils/regex-tester",
  "/utils/contrast-checker",
  "/utils/hash-generator",
  "/tags",
  "/tags/react",
  "/search",
  "/series",
  "/series/parcours",
  "/projects",
  "/projects/portfolio",
  "/experience",
  "/experience/wefix-by-fnac",
  "/en/projects/portfolio",
  "/uses",
  "/now",
  "/weight",
];

/** Le composant est là pour DÉMONTRER un contraste insuffisant : son aperçu ne
 * peut pas être conforme, puisqu'il affiche la paire de couleurs saisie. */
const DELIBERATE_EXCLUSIONS = [
  "[data-slot='utils-contrast-checker'] [style]",
];

/**
 * Attend la fin des animations avant de mesurer.
 *
 * axe échantillonne la couleur CALCULÉE. Pendant un fondu d'ouverture, cette
 * couleur est INTERMÉDIAIRE : un libellé qui finira noir sur blanc a été mesuré
 * à #b2b2b3 sur #fbfafa, soit 2,03:1, et le scan a signalé une violation de
 * contraste sur une couleur que personne n'a choisie et que personne ne voit.
 *
 * Attendre la visibilité du champ ne suffisait pas : le panneau est visible dès
 * qu'il entre dans le DOM, alors que son fondu commence à peine. On attend donc
 * les animations elles-mêmes — en ignorant celles qui bouclent à l'infini
 * (particules, icônes animées), qui ne finiront jamais.
 */
const settleAnimations = async (page: Page) => {
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((animation) => {
      const iterations = animation.effect?.getTiming().iterations;
      return iterations !== Number.POSITIVE_INFINITY;
    });

    // une animation interrompue rejette : l'échec n'a pas d'intérêt ici, seul
    // compte le fait qu'elle ne tourne plus
    await Promise.allSettled(
      finite.map((animation) => animation.finished)
    );
  });
};

const scan = async (page: Page) => {
  await settleAnimations(page);

  const builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);

  for (const selector of DELIBERATE_EXCLUSIONS) {
    builder.exclude(selector);
  }

  const { violations } = await builder.analyze();

  /**
   * Plus aucune dette n'est tolérée.
   *
   * Les deux entrées listées ici sont fermées : la couleur de marque est passée
   * de 4,4995:1 à 4,5102:1, et le jeton orange du thème Shiki est relevé au
   * build par `rehype-shiki-contrast`. TOUTE violation de contraste fait donc
   * échouer ce test, sans exception à lire.
   */
  return violations.flatMap((violation) =>
    violation.nodes.map(
      (node) =>
        `${violation.id} · ${node.target.join(" ")} · ${node.any
          .map((check) => check.message)
          .join(" | ")}`
    )
  );
};

test.describe("accessibilité automatique", () => {
  /**
   * Un onglet fermé n'est pas rendu : le scan d'une page de composant ne voyait
   * donc jamais le bac à sable, avec ses cases à cocher et ses champs. Cet état
   * mérite le même contrôle que le reste.
   */
  test("le bac à sable ouvert est conforme", async ({ page }) => {
    await page.goto("/components/flip-sentences-component");
    await page.waitForLoadState("networkidle");
    await page.getByRole("tab", { name: "bac à sable" }).click();

    // attendre le bouton de copie, pas seulement le conteneur : le panneau est
    // visible dès qu'il entre dans le DOM, alors que le composant et le bouton
    // arrivent encore. Scanner à cet instant faisait remonter un bouton sans nom
    // qui, une fois monté, en a bien un.
    await expect(
      page.getByRole("button", {
        name: "copier le code du bac à sable",
      })
    ).toBeVisible();

    expect(await scan(page)).toEqual([]);
  });

  for (const path of PAGES) {
    test(`aucune violation axe sur ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(await scan(page), `violations axe sur ${path}`).toEqual(
        []
      );
    });
  }
});

/**
 * Le thème sombre, enfin scannable.
 *
 * Les tentatives précédentes donnaient des mesures qu'axe ne pouvait pas
 * résoudre : il rapportait un fond BLANC alors que le document portait la classe
 * `dark`. La cause vient d'être trouvée — ni html ni body ne peignaient de
 * background-color, le fond venait du canevas de l'agent utilisateur via
 * `color-scheme`, et un canevas n'est pas un style calculé. Maintenant que body
 * peint `--canvas`, `colorScheme: "dark"` suffit : next-themes est en
 * `defaultTheme: system`, donc la préférence émulée pilote réellement le thème.
 *
 * La liste est plus courte que celle du thème clair : ce sont les pages où la
 * couleur porte de l'information, pas les 16 types de pages.
 */
test.describe("accessibilité en thème sombre", () => {
  test.use({ colorScheme: "dark" });

  for (const path of [
    "/",
    "/articles",
    "/articles/how-i-write-css",
    "/tags",
    "/utils/contrast-checker",
    "/search",
    "/en",
  ]) {
    test(`aucune violation axe sur ${path} en sombre`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // garde-fou sur la garde : si le document ne bascule pas réellement en
      // sombre, le test scannerait le thème clair une seconde fois et passerait
      // au vert sans rien vérifier de neuf
      await expect(page.locator("html")).toHaveClass(/dark/u);

      expect(
        await scan(page),
        `violations axe en sombre sur ${path}`
      ).toEqual([]);
    });
  }
});

/**
 * Les surfaces INTERACTIVES.
 *
 * Le scan couvrait 18 URL et un seul état ouvert, le bac à sable. La palette ⌘K,
 * la feuille de raccourcis et la modale d'envoi de CV n'étaient jamais auditées :
 * un composant fermé n'est pas rendu, donc axe ne le voit pas. Ce sont pourtant
 * les surfaces les plus riches en champs, en rôles et en pièges de focus.
 */
test.describe("accessibilité des surfaces interactives", () => {
  test("la palette de commandes ouverte est conforme", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.getByPlaceholder(/./u)).toBeVisible();

    expect(await scan(page)).toEqual([]);
  });

  test("la feuille de raccourcis ouverte est conforme", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("?");
    await expect(
      page.locator('[data-slot="shortcuts-sheet"]')
    ).toBeVisible();

    expect(await scan(page)).toEqual([]);
  });

  /**
   * Le formulaire d'envoi de CV n'a PAS de test dédié, volontairement.
   *
   * Il est rendu en permanence sur la page d'accueil, donc le scan de « / » le
   * couvre déjà. Ce qui manquait, ce sont les surfaces qu'il faut ouvrir pour
   * qu'elles existent : un composant fermé n'est pas dans le DOM, et axe ne peut
   * rien en dire. (Ma première version cherchait un `<form>` sur « / » et
   * échouait faute d'en trouver un — le formulaire n'utilise pas cette balise.)
   */
});

/**
 * Le libellé dans le nom (WCAG 2.5.3), là où il faut OUVRIR pour le voir.
 *
 * axe ne juge un lien que s'il est rendu. Trois liens portaient un `aria-label`
 * étranger à leur texte dans des états qu'aucun scan n'atteint : celui d'une
 * certification repliée, celui du dialogue d'un article, et le retour de la
 * page 404. Les 26 URL pouvaient donc passer au vert en les laissant en défaut
 * — qui dicte « voir la certification » n'activait rien.
 *
 * Une seule règle est exécutée ici, pas le scan complet. Ces états n'ont jamais
 * été audités et le dialogue d'article a une dette de contraste (4,39:1 et
 * 4,47:1 mesurés sur son fond) : la fermer est un autre chantier, et la mêler à
 * ce test ferait échouer une garde pour une raison qui n'est pas la sienne.
 */
const scanLabelInName = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page })
    .withRules(["label-content-name-mismatch"])
    .analyze();

  return violations.flatMap((violation) =>
    violation.nodes.map(
      (node) => `${violation.id} · ${node.target.join(" ")}`
    )
  );
};

test.describe("libellé dans le nom, états à ouvrir", () => {
  test("le lien d'une certification dépliée", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const panel = page
      .getByRole("heading", { name: /mes certifications/iu })
      .locator("xpath=ancestor::*[@data-slot='panel'][1]");
    const link = panel.getByRole("link", {
      name: /voir la certification/iu,
    });

    // repliée, la certification n'expose aucun lien : c'est bien ce qui la
    // rendait invisible au scan de « / »
    await expect(link).toHaveCount(0);

    await panel.getByRole("button").first().click();
    await expect(link).toBeVisible();

    expect(await scanLabelInName(page)).toEqual([]);
  });

  test("le lien du dialogue d'un article", async ({ page }) => {
    await page.goto("/articles");
    await page.waitForLoadState("networkidle");

    await page
      .locator('[data-slot="dialog-trigger-anchor"]')
      .first()
      .click();

    await expect(
      page
        .getByRole("dialog")
        .getByRole("link", { name: /lire l'article/iu })
    ).toBeVisible();

    expect(await scanLabelInName(page)).toEqual([]);
  });

  test("le lien de retour de la page 404", async ({ page }) => {
    await page.goto("/cette-page-n-existe-pas");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("link", { name: /revenir en arrière/iu })
    ).toBeVisible();

    expect(await scanLabelInName(page)).toEqual([]);
  });
});
