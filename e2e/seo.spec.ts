import type { APIRequestContext } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Ce que le site dit de lui-même aux machines.
 *
 * Titres, données structurées, icône : rien de tout cela ne se voit en
 * naviguant, et chacun de ces tests correspond à une sortie qui était fausse
 * dans le HTML SERVI alors que les tests unitaires passaient — un gabarit de
 * titre remplacé par un layout, une date lue à l'horloge au rendu, un lien que
 * le serveur redirige. Ils lisent donc la réponse du serveur, pas un module.
 */

const NAME = "florin cuzeac";
const ORIGIN = "https://cuzeacflorin.fr";

const TITLE = /<title>([^<]*)<\/title>/u;
const JSON_LD =
  /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gsu;

type Node = Record<string, unknown>;

const decode = (value: string): string =>
  value
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&");

const html = async (
  request: APIRequestContext,
  path: string
): Promise<string> => {
  const response = await request.get(path);

  expect(response.status(), path).toBe(200);

  return await response.text();
};

/** Tous les nœuds JSON-LD d'une page, les `@graph` mis à plat. */
const jsonLd = (document: string): Node[] =>
  [...document.matchAll(JSON_LD)].flatMap(([, raw]) => {
    const parsed = JSON.parse(raw ?? "null") as Node;
    const graph = parsed["@graph"];

    return Array.isArray(graph) ? (graph as Node[]) : [parsed];
  });

const nodeOfType = (document: string, type: string): Node => {
  const found = jsonLd(document).find(
    (entry) => entry["@type"] === type
  );

  expect(found, `nœud ${type} absent`).toBeDefined();

  return found as Node;
};

test.describe("titres", () => {
  /**
   * Le sitemap, pas une liste : une page ajoutée demain sous un layout qui
   * redéclare son gabarit perdrait le nom sans qu'aucune liste ne le sache.
   */
  test("chaque page du sitemap porte le nom, une seule fois", async ({
    request,
  }) => {
    const sitemap = await html(request, "/sitemap.xml");
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map(
      ([, url]) => (url ?? "").replace(ORIGIN, "") || "/"
    );

    // garde-fou sur la garde : un sitemap vide passerait au vert
    expect(paths.length).toBeGreaterThan(20);

    const wrong: string[] = [];

    for (const path of paths) {
      const title = decode(
        TITLE.exec(await html(request, path))?.[1] ?? ""
      );
      const isHome = path === "/" || path === "/en";
      // l'accueil COMMENCE par le nom, les autres pages finissent par lui
      const expected = isHome
        ? title.startsWith(`${NAME} — `)
        : title.endsWith(` — ${NAME}`);

      if (!expected || title.split(NAME).length !== 2) {
        wrong.push(`${path} → « ${title} »`);
      }
    }

    expect(wrong, wrong.join("\n")).toEqual([]);
  });

  test("l'accueil se présente dans la langue de son arbre", async ({
    request,
  }) => {
    const french = await html(request, "/");
    const english = await html(request, "/en");

    expect(decode(TITLE.exec(french)?.[1] ?? "")).toBe(
      "florin cuzeac — développeur Full-Stack Senior"
    );
    expect(decode(TITLE.exec(english)?.[1] ?? "")).toBe(
      "florin cuzeac — senior full-stack developer"
    );
    // la description n'était que l'accroche, sans nom ni métier
    expect(english).toContain(
      'name="description" content="florin cuzeac — senior full-stack developer. '
    );
  });
});

test.describe("données structurées", () => {
  /**
   * La date était lue à l'horloge pendant le rendu d'une page revalidée toutes
   * les heures : elle disait « aujourd'hui » quand le sitemap disait le 12 août.
   */
  test("l'accueil date sa modification comme le sitemap", async ({
    request,
  }) => {
    const sitemap = await html(request, "/sitemap.xml");
    // l'entrée de l'accueil : ses `hreflang` s'intercalent entre `<loc>` et
    // `<lastmod>`
    const entry = sitemap
      .split("<url>")
      .find((block) => block.includes(`<loc>${ORIGIN}</loc>`));
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/u.exec(
      entry ?? ""
    )?.[1];

    expect(lastmod).toBeTruthy();

    for (const path of ["/", "/en"]) {
      const profile = nodeOfType(
        await html(request, path),
        "ProfilePage"
      );

      expect(profile.dateModified, path).toBe(lastmod);
    }
  });

  test("la personne n'a qu'un employeur actuel", async ({
    request,
  }) => {
    const person = nodeOfType(await html(request, "/"), "Person");
    const names = (key: string): string[] =>
      (person[key] as { name: string }[]).map((entry) => entry.name);

    // SpinalCom et l'Économat des Armées étaient déclarés employeurs actuels
    expect(names("worksFor")).toEqual(["Cospal"]);
    expect(names("alumniOf")).toEqual([
      "WeFix by Fnac",
      "SpinalCom",
      "Économat des Armées",
    ]);
  });

  test("un article anglais publie ses mots-clés en anglais", async ({
    request,
  }) => {
    const article = nodeOfType(
      await html(request, "/en/articles/how-i-write-css"),
      "BlogPosting"
    );

    // un tag est une clé écrite en français : c'est son libellé qui sort
    expect(String(article.keywords)).toContain("lessons learned");
    expect(String(article.keywords)).not.toContain("retour");
  });

  /**
   * `localizeHref("/")` rend « /en/ », que le serveur redirige vers « /en » :
   * le lien et le balisage passaient par cette redirection sur chaque page
   * anglaise, alors que le canonical et le sitemap disent « /en ».
   */
  test("le fil d'Ariane anglais mène à /en sans redirection", async ({
    request,
  }) => {
    const document = await html(
      request,
      "/en/articles/how-i-write-css"
    );
    const [home] = nodeOfType(document, "BreadcrumbList")
      .itemListElement as { item?: string }[];

    expect(home?.item).toBe(`${ORIGIN}/en`);
    expect(document).toMatch(
      /<a[^>]*data-slot="breadcrumb-link"[^>]*href="\/en"/u
    );
    expect(document).not.toContain('href="/en/"');
  });
});

test.describe("icône du site", () => {
  /**
   * Tout ce qui ne lit pas le `<head>` demande /favicon.ico : un lecteur de
   * flux, un onglet ouvert sur un flux ou sur un miroir texte. La réponse était
   * un 404 de 40 Ko de HTML.
   */
  test("/favicon.ico est une icône", async ({ request }) => {
    const response = await request.get("/favicon.ico");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\//u);

    const body = await response.body();
    // en-tête ICO : réservé 0, type 1 (icône)
    expect([...body.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
  });
});
