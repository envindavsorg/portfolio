import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Aides à la lecture d'un article : contenus liés, sommaire, raccourcis
 * clavier, barre de progression et retour en haut.
 *
 * Ces éléments n'existent que côté client : ils ne se vérifient pas en relisant
 * le HTML, il faut vraiment défiler et taper au clavier.
 */

/**
 * Attend la fin de la transition entre onglets : `AnimatePresence` garde le
 * panneau sortant monté le temps de l'animation, il y a donc transitoirement
 * deux `role="tabpanel"`.
 */
const settle = async (page: Page) => {
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
};

const ARTICLE = "/articles/my-stack";
const NEWER = "/articles/how-i-write-css";
const OLDER = "/articles/things-i-believe-in";

test.describe("contenus liés", () => {
  test("propose des articles proches, jamais l'article courant", async ({
    page,
  }) => {
    await page.goto(NEWER);

    const related = page
      .getByRole("heading", { name: "à lire aussi" })
      .locator("xpath=ancestor::*[@data-slot='panel'][1]");

    await expect(related).toBeVisible();

    const links = related.getByRole("link");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const href = await links.nth(index).getAttribute("href");
      expect(href).not.toBe(NEWER);
      expect(href).toMatch(/^\/(articles|components|utils)\//u);
    }
  });

  test("un lien mène bien à l'article suggéré", async ({ page }) => {
    await page.goto(NEWER);

    const link = page
      .getByRole("heading", { name: "à lire aussi" })
      .locator("xpath=ancestor::*[@data-slot='panel'][1]")
      .getByRole("link")
      .first();

    const href = await link.getAttribute("href");
    await link.click();

    await expect(page).toHaveURL(href ?? "");
    // le titre de page est le seul h1 depuis le décalage des niveaux MDX
    await expect(
      page.getByRole("heading", { level: 1 }).first()
    ).toBeVisible();
  });

  /**
   * Un tag est une CLÉ, écrite en français parce qu'elle produit le slug. La
   * phrase destinée aux lecteurs d'écran l'imprimait telle quelle : sous /en,
   * « 1 shared tag: retour d'expérience ».
   */
  test("les sujets en commun sont annoncés dans la langue de la page", async ({
    page,
  }) => {
    const panel = (name: string) =>
      page
        .getByRole("heading", { name })
        .locator("xpath=ancestor::*[@data-slot='panel'][1]");

    // le témoin : la clé française est bien celle que ces articles partagent,
    // sinon son absence sous /en ne prouverait rien
    await page.goto(NEWER);
    await expect(panel("à lire aussi")).toContainText(
      /tags? en commun : .*retour d'expérience/u
    );

    await page.goto(`/en${NEWER}`);
    await expect(panel("related reading")).toContainText(
      /shared tags?: .*lessons learned/u
    );
    await expect(panel("related reading")).not.toContainText(
      "retour d'expérience"
    );
  });
});

/**
 * Un sommaire par largeur : le panneau dépliable sous 1280px, un rail permanent
 * dans la marge au-delà. Les deux mènent à la section choisie ; le rail montre
 * en plus où l'on se trouve, ce que le panneau — refermé à chaque clic — ne
 * pouvait pas faire.
 */
const TOC_NAME = /points importants sur cette page/iu;

const followEntry = async (page: Page) => {
  const entry = page.getByRole("link", {
    name: /^4\. mes règles$/iu,
  });
  await expect(entry).toBeVisible();

  const href = await entry.getAttribute("href");
  expect(href).toMatch(/^#/u);

  await entry.click();
  // le navigateur encode les accents dans le fragment
  await expect
    .poll(() => decodeURIComponent(page.url()))
    .toContain(href ?? "");

  // sélecteur par attribut : l'ancre commence par un chiffre et contient un
  // accent, ce qui n'est pas un sélecteur d'identifiant CSS valide
  const target = page.locator(`[id="${(href ?? "").slice(1)}"]`);
  await expect(target).toBeInViewport();

  return entry;
};

test.describe("sommaire", () => {
  test.describe("sous 1280px", () => {
    test.use({ viewport: { height: 800, width: 1024 } });

    test("liste les sections et amène à celle qu'on choisit", async ({
      page,
    }) => {
      await page.goto(NEWER);

      // un seul sommaire à la fois : le rail n'existe pas à cette largeur
      await expect(
        page.getByRole("navigation", { name: TOC_NAME })
      ).toHaveCount(0);

      const trigger = page.getByRole("button", { name: TOC_NAME });
      await expect(trigger).toBeVisible();
      await trigger.click();

      await followEntry(page);
    });
  });

  test("reste dans la marge sur grand écran et suit la lecture", async ({
    page,
  }) => {
    await page.goto(NEWER);

    // un seul sommaire à la fois : plus de panneau à déplier
    await expect(
      page.getByRole("button", { name: TOC_NAME })
    ).toHaveCount(0);

    const rail = page.getByRole("navigation", { name: TOC_NAME });
    await expect(rail).toBeVisible();

    // dans la marge, pas par-dessus la colonne de lecture
    const railBox = await rail.boundingBox();
    const bodyBox = await page
      .locator("[data-longform]")
      .boundingBox();
    expect(railBox?.x ?? 0).toBeGreaterThanOrEqual(
      (bodyBox?.x ?? 0) + (bodyBox?.width ?? 0)
    );

    const entry = await followEntry(page);

    // la section atteinte est marquée, et le rail est toujours là
    await expect(entry).toHaveAttribute("aria-current", "location");
    await expect(rail).toBeVisible();
    await expect(rail.locator("[aria-current]")).toHaveCount(1);
  });

  test("la marque suit un saut, pas seulement un défilement", async ({
    page,
  }) => {
    await page.goto(NEWER);
    await expect(
      page.getByRole("navigation", { name: TOC_NAME })
    ).toBeVisible();

    // par CSS et non par rôle : en bas de page le rail est `invisible`, donc
    // absent de l'arbre d'accessibilité, alors que sa marque doit déjà être
    // juste pour le moment où il réapparaît
    const rail = page.locator(
      'nav[aria-label*="points importants sur cette page" i]'
    );
    const marked = rail.locator("[aria-current]");

    // au-dessus du premier titre, on n'est dans aucune section
    await expect(marked).toHaveCount(0);

    // un saut, sans passer par les titres : aucun ne « traverse » l'écran
    await page.evaluate(() =>
      window.scrollTo({
        behavior: "instant",
        top: document.documentElement.scrollHeight,
      })
    );
    await expect(rail.locator("a").last()).toHaveAttribute(
      "aria-current",
      "location"
    );
    await expect(marked).toHaveCount(1);

    // retour en haut d'un seul coup : la dernière section restait marquée
    await page.evaluate(() =>
      window.scrollTo({ behavior: "instant", top: 0 })
    );
    await expect(marked).toHaveCount(0);
  });

  test("le rail s'efface une fois l'article passé", async ({
    page,
  }) => {
    await page.goto(NEWER);

    const rail = page.getByRole("navigation", { name: TOC_NAME });
    await expect(rail).toBeVisible();

    // le pied de page partage la colonne : sans cela le sommaire restait
    // affiché à côté de lui, traversé par ses lignes
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(rail).toBeHidden();
  });
});

test.describe("raccourcis clavier de navigation", () => {
  test("les flèches passent à l'article précédent et suivant", async ({
    page,
  }) => {
    await page.goto(ARTICLE);
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(OLDER);

    await page.goto(ARTICLE);
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(NEWER);
  });

  test("les flèches sont neutres dans un champ de saisie", async ({
    page,
  }) => {
    await page.goto("/utils/hash-generator");
    await page.waitForLoadState("networkidle");

    const field = page.getByLabel("texte à hacher");
    await field.fill("abc");
    await field.press("ArrowLeft");
    await field.press("ArrowRight");

    // sinon une simple correction de frappe éjecterait le visiteur de la page
    await expect(page).toHaveURL("/utils/hash-generator");
    await expect(field).toHaveValue("abc");
  });
});

test.describe("progression et retour en haut", () => {
  test("la barre de progression suit le défilement", async ({
    page,
  }) => {
    await page.goto(NEWER);

    const bar = page
      .locator("[data-slot='reading-progress'] > div")
      .first();

    const widthOf = () =>
      bar.evaluate((element) => (element as HTMLElement).style.width);

    expect(Number.parseFloat(await widthOf())).toBeLessThan(5);

    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight)
    );
    await expect
      .poll(async () => Number.parseFloat(await widthOf()))
      .toBeGreaterThan(95);
  });

  test("le bouton de retour en haut n'apparaît qu'après deux écrans", async ({
    page,
  }) => {
    await page.goto(NEWER);

    const button = page.getByRole("button", {
      name: "revenir en haut de la page",
    });
    await expect(button).toBeHidden();

    await page.evaluate(() =>
      window.scrollTo(0, window.innerHeight * 3)
    );
    await expect(button).toBeVisible();

    await button.click();
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBe(0);

    // le focus repart du début du contenu, pas du milieu de l'article quitté
    await expect(page.locator("main")).toBeFocused();
  });
});

test.describe("onglets", () => {
  test("les flèches parcourent les onglets et un seul est tabulable", async ({
    page,
  }) => {
    await page.goto("/utils/base64-encode-decode");
    await page.waitForLoadState("networkidle");

    const encode = page.getByRole("tab", {
      name: "encoder la chaîne",
    });
    const decode = page.getByRole("tab", {
      name: "décoder la chaîne",
    });

    await expect(encode).toHaveAttribute("aria-selected", "true");
    await expect(encode).toHaveAttribute("tabindex", "0");
    await expect(decode).toHaveAttribute("aria-selected", "false");
    await expect(decode).toHaveAttribute("tabindex", "-1");

    await encode.focus();
    await page.keyboard.press("ArrowRight");

    await expect(decode).toHaveAttribute("aria-selected", "true");
    await expect(decode).toBeFocused();
    await expect(encode).toHaveAttribute("tabindex", "-1");

    // la transition anime le panneau : le composant refuse de rebasculer avant
    // la fin, il faut donc la laisser se terminer entre deux frappes
    await settle(page);

    // la liste boucle : depuis le dernier onglet, → revient au premier
    await page.keyboard.press("ArrowRight");
    await expect(encode).toHaveAttribute("aria-selected", "true");
    await expect(encode).toBeFocused();

    await settle(page);

    await page.keyboard.press("ArrowLeft");
    await expect(decode).toHaveAttribute("aria-selected", "true");
    // le focus ne doit jamais rester en arrière de la sélection
    await expect(decode).toBeFocused();
  });

  test("les flèches ne font pas changer de page", async ({
    page,
  }) => {
    await page.goto("/utils/base64-encode-decode");
    await page.waitForLoadState("networkidle");

    // les mêmes flèches pilotent la navigation article précédent/suivant : sans
    // garde, basculer d'onglet au clavier éjectait le visiteur vers un autre outil
    await page
      .getByRole("tab", { name: "encoder la chaîne" })
      .focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: "décoder la chaîne" })
    ).toHaveAttribute("aria-selected", "true");

    await settle(page);
    await expect(page).toHaveURL("/utils/base64-encode-decode");
  });

  test("le panneau affiché correspond à l'onglet actif", async ({
    page,
  }) => {
    await page.goto("/utils/base64-encode-decode");
    await page.waitForLoadState("networkidle");

    const panel = page.getByRole("tabpanel");
    await expect(panel).toHaveAttribute("aria-labelledby", "tab-0");

    await page
      .getByRole("tab", { name: "décoder la chaîne" })
      .click();

    // pendant la transition les deux panneaux coexistent ; à la fin il ne doit
    // en rester qu'un, sinon deux `role="tabpanel"` se disputent le même onglet
    await settle(page);
    await expect(page.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      "tab-1"
    );
  });
});

/**
 * La chaîne MDX elle-même.
 *
 * rehype-pretty-code émettait déjà `data-highlighted-line` et le titre de bloc,
 * mais AUCUNE règle CSS ne les consommait et aucun test ne couvrait la chaîne :
 * la fonctionnalité était payée et invisible. Ces assertions portent sur le
 * rendu réel, pas sur la configuration du plugin.
 */
test.describe("rendu des blocs de code", () => {
  test("une clôture avec {2-5} met les lignes en évidence", async ({
    page,
  }) => {
    await page.goto("/components/flip-sentences-component");

    const highlighted = page.locator("[data-highlighted-line]");
    await expect(highlighted).toHaveCount(4);

    // la règle doit peindre quelque chose : un jeton défini et jamais appliqué
    // est exactement l'état d'où l'on vient
    const background = await highlighted
      .first()
      .evaluate((node) => getComputedStyle(node).backgroundColor);

    expect(background).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("le titre de la clôture est rendu", async ({ page }) => {
    await page.goto("/components/flip-sentences-component");

    // et NON `.first()` : la page contient déjà des blocs <ComponentSource> qui
    // portent leur propre titre, et le premier est `lib/utils.ts`
    await expect(
      page
        .locator("[data-rehype-pretty-code-title]", {
          hasText: "sentences.ts",
        })
        // le bloc est émis une fois par thème : les deux portent le même titre
        .first()
    ).toBeVisible();
  });
});

/**
 * Un seul <h1> par page.
 *
 * Les corps MDX utilisaient `#` pour leurs sections : chaque page de contenu
 * rendait donc un h1 de titre PLUS un h1 par section — jusqu'à huit sur un
 * article — et un plan de document entièrement plat. Tout est descendu d'un
 * niveau ; l'échelle typographique a été translatée d'autant pour que le rendu
 * ne change pas.
 *
 * Les identifiants ne bougent pas : rehype-slug les dérive du TEXTE, le niveau
 * ne servant que de garde booléenne. Les ancres partagées survivent donc, ce qui
 * a été vérifié page par page avant et après le décalage.
 */
test.describe("plan du document", () => {
  for (const path of [
    "/articles/how-i-write-css",
    "/articles/my-stack",
    "/components/flip-sentences-component",
    "/utils/regex-tester",
    "/en/articles/how-i-write-css",
    "/en/utils/regex-tester",
  ]) {
    test(`${path} n'a qu'un seul h1`, async ({ page }) => {
      await page.goto(path);

      await expect(
        page.getByRole("heading", { level: 1 })
      ).toHaveCount(1);

      // et il reste des sections : un plan à un seul niveau serait « conforme »
      // en n'ayant simplement plus aucun titre de section
      expect(
        await page.getByRole("heading", { level: 2 }).count()
      ).toBeGreaterThan(0);
    });
  }
});

/**
 * Les encarts d'avertissement.
 *
 * `remark-gfm` ne transforme PAS `> [!NOTE]` : il rend un blockquote contenant
 * le texte littéral `[!NOTE]`. Les mises en garde des articles se lisaient donc
 * comme des paragraphes ordinaires.
 */
test.describe("encarts d'avertissement", () => {
  for (const [path, label] of [
    ["/articles/how-i-write-css", "attention"],
    ["/en/articles/how-i-write-css", "warning"],
  ] as const) {
    test(`${path} rend l'encart et son libellé traduit`, async ({
      page,
    }) => {
      await page.goto(path);

      const callout = page.locator('[data-callout="warning"]');
      await expect(callout).toBeVisible();

      // le genre est porté par du TEXTE : la couleur ne doit jamais être le
      // seul véhicule de l'information
      await expect(callout).toContainText(label);

      // et le marqueur brut ne doit plus apparaître à l'écran
      await expect(callout).not.toContainText("[!WARNING]");
    });
  }

  test("un blockquote ordinaire reste un blockquote", async ({
    page,
  }) => {
    await page.goto("/articles/how-i-write-css");

    // sinon le plugin transformerait toutes les citations en encarts
    const quotes = await page.locator("blockquote").count();
    const callouts = await page.locator("[data-callout]").count();

    expect(callouts).toBeGreaterThan(0);
    expect(quotes).not.toBe(callouts);
  });
});
