import { expect, test } from "@playwright/test";

/**
 * Cartes sociales.
 *
 * Une image ne se vérifie pas en lisant du HTML, et personne ne regarde une
 * carte sociale après l'avoir écrite. Ces tests portent donc sur des propriétés
 * qu'on peut mesurer sur les OCTETS, et chacune correspond à une panne réelle.
 *
 * La plus utile est celle du titre : la route sert une carte de REPLI quand le
 * rendu échoue, et ce repli ignore le titre demandé. Une police introuvable —
 * c'est arrivé en écrivant ce code, sur un nom de fichier erroné — faisait donc
 * servir la même image pour toutes les pages du site, avec un code 200 et un PNG
 * parfaitement valide. Rien ne l'aurait signalé.
 */

const og = (params: Record<string, string>): string =>
  `/api/og?${new URLSearchParams(params)}`;

const fetchImage = async (
  request: {
    get: (url: string) => Promise<{
      status: () => number;
      headers: () => Record<string, string>;
      body: () => Promise<Buffer>;
    }>;
  },
  params: Record<string, string>
) => {
  const response = await request.get(og(params));

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");

  return await response.body();
};

test.describe("cartes sociales", () => {
  test("le titre demandé change réellement l'image", async ({
    request,
  }) => {
    const first = await fetchImage(request, {
      title: "premier titre",
      type: "blogArticle",
    });
    const second = await fetchImage(request, {
      title: "un tout autre titre",
      type: "blogArticle",
    });

    // si le rendu tombait dans le repli, les deux seraient identiques
    expect(first.equals(second)).toBe(false);
  });

  /**
   * Le cœur de ce travail : deux rubriques ne doivent pas produire la même
   * carte. Sans cette assertion, on pourrait revenir à un gabarit unique sans
   * qu'aucun test ne bouge.
   */
  test("chaque famille de page produit une carte différente", async ({
    request,
  }) => {
    const types = [
      "homepage",
      "blogArticle",
      "utilsArticle",
      "project",
      "experience",
      "componentsArticle",
    ];

    const images = await Promise.all(
      types.map((type) =>
        fetchImage(request, { title: "même titre partout", type })
      )
    );

    const duplicates: string[] = [];

    for (let left = 0; left < images.length; left += 1) {
      for (let right = left + 1; right < images.length; right += 1) {
        if (images[left].equals(images[right])) {
          duplicates.push(`${types[left]} = ${types[right]}`);
        }
      }
    }

    expect(duplicates).toEqual([]);
  });

  test("la locale change le mot de la pastille", async ({
    request,
  }) => {
    const fr = await fetchImage(request, {
      title: "outil",
      type: "utilsArticle",
    });
    const en = await fetchImage(request, {
      locale: "en",
      title: "outil",
      type: "utilsArticle",
    });

    expect(fr.equals(en)).toBe(false);
  });

  test("la ligne de méta apparaît sur la carte", async ({
    request,
  }) => {
    const sans = await fetchImage(request, {
      title: "un article",
      type: "blogArticle",
    });
    const avec = await fetchImage(request, {
      meta: "6 min · 2026-08-12",
      title: "un article",
      type: "blogArticle",
    });

    expect(sans.equals(avec)).toBe(false);
  });

  test("un type inconnu rend quand même une carte", async ({
    request,
  }) => {
    await fetchImage(request, { title: "inconnu", type: "nawak" });
    // `in` remonte la chaîne de prototypes : ce type-là passait la validation
    await fetchImage(request, {
      title: "prototype",
      type: "toString",
    });
  });

  test("un titre démesuré ne fait pas tomber la route", async ({
    request,
  }) => {
    await fetchImage(request, {
      description: "d".repeat(5000),
      title: "t".repeat(5000),
      type: "blogArticle",
    });
  });

  test("les pages déclarent leur carte dans leurs métadonnées", async ({
    request,
  }) => {
    const cases: [string, string][] = [
      ["/articles/how-i-write-css", "blogArticle"],
      ["/utils/regex-tester", "utilsArticle"],
      ["/projects/portfolio", "project"],
      ["/experience/wefix-by-fnac", "experience"],
      ["/", "homepage"],
    ];

    for (const [path, type] of cases) {
      const response = await request.get(path);
      const html = await response.text();

      expect(
        html,
        `${path} doit demander une carte de type ${type}`
      ).toContain(`type=${type}`);
    }
  });
});
