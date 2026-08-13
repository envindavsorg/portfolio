import { describe, expect, it } from "vitest";

import type { Content, ContentCategory } from "@/lib/content";
import {
  ALL_TAG,
  getContentByTagSlug,
  getTagBySlug,
  getTagData,
  getTagIndex,
  isActiveTag,
  matchesTag,
  slugifyTag,
  tagLabel,
} from "@/lib/tags";

const makeContent = (
  tags?: string[],
  slug = "test",
  category: ContentCategory = "articles"
): Content =>
  ({
    content: "",
    metadata: {
      category,
      createdAt: new Date("2026-01-01"),
      description: "",
      tags,
      title: slug,
      updatedAt: new Date("2026-01-01"),
    },
    reading: { time: "1 minutes", words: 10 },
    slug,
  }) as Content;

describe("matchesTag", () => {
  it("matche tout avec le tag par défaut", () => {
    expect(matchesTag(["css"], ALL_TAG)).toBe(true);
    expect(matchesTag(undefined, ALL_TAG)).toBe(true);
  });

  it("matche un tag indépendamment de la casse", () => {
    expect(matchesTag(["CSS"], "css")).toBe(true);
    expect(matchesTag(["react"], "css")).toBe(false);
  });

  it("ne matche pas sans tags", () => {
    expect(matchesTag(undefined, "css")).toBe(false);
    expect(matchesTag([], "css")).toBe(false);
  });
});

describe("isActiveTag", () => {
  it("gère le tag 'tout'", () => {
    expect(isActiveTag(ALL_TAG, ALL_TAG)).toBe(true);
    expect(isActiveTag(ALL_TAG, "css")).toBe(false);
  });

  it("compare en minuscules", () => {
    expect(isActiveTag("CSS", "css")).toBe(true);
  });
});

describe("getTagData", () => {
  it("compte les contenus par tag avec 'tout' en tête", () => {
    const contents = [
      makeContent(["css", "react"]),
      makeContent(["css"]),
      makeContent(),
    ];

    const { tagCounts, tags } = getTagData(contents);

    expect(tags[0]).toBe(ALL_TAG);
    expect(tagCounts[ALL_TAG]).toBe(3);
    expect(tagCounts.css).toBe(2);
    expect(tagCounts.react).toBe(1);
  });

  it("trie les tags alphabétiquement", () => {
    const contents = [makeContent(["zod", "axe", "motion"])];
    const { tags } = getTagData(contents);
    expect(tags.slice(1)).toEqual(["axe", "motion", "zod"]);
  });
});

describe("slugifyTag", () => {
  it("retire les accents et la ponctuation", () => {
    expect(slugifyTag("retour d'expérience")).toBe(
      "retour-d-experience"
    );
    expect(slugifyTag("Next.js")).toBe("next-js");
    expect(slugifyTag("CSS")).toBe("css");
  });

  it("ne laisse ni tiret en bord ni tiret double", () => {
    expect(slugifyTag("  — accessibilité !  ")).toBe("accessibilite");
    expect(slugifyTag("a / b")).toBe("a-b");
  });

  it("renvoie une chaîne vide pour un tag sans caractère utile", () => {
    expect(slugifyTag("!!!")).toBe("");
    expect(slugifyTag("")).toBe("");
  });
});

describe("getTagIndex", () => {
  it("agrège les catégories d'un même sujet", () => {
    const contents = [
      makeContent(["css"], "a", "articles"),
      makeContent(["css"], "b", "components"),
      makeContent(["css"], "c", "utils"),
    ];

    const [entry] = getTagIndex(contents);

    expect(entry?.slug).toBe("css");
    expect(entry?.count).toBe(3);
    expect(entry?.categories).toEqual([
      "articles",
      "components",
      "utils",
    ]);
  });

  it("regroupe les orthographes qui donnent le même slug", () => {
    const contents = [
      makeContent(["Next.js"], "a"),
      makeContent(["next js"], "b"),
      makeContent(["Next.js"], "c"),
    ];

    const [entry] = getTagIndex(contents);

    expect(entry?.slug).toBe("next-js");
    expect(entry?.count).toBe(3);
    // « Next.js » apparaît deux fois, c'est donc lui qu'on affiche
    expect(entry?.label).toBe("Next.js");
    expect(entry?.variants).toEqual(["Next.js", "next js"]);
  });

  it("classe par nombre de contenus décroissant puis par libellé", () => {
    const contents = [
      makeContent(["react", "zod", "axe"], "a"),
      makeContent(["react"], "b"),
    ];

    expect(getTagIndex(contents).map((tag) => tag.slug)).toEqual([
      "react",
      "axe",
      "zod",
    ]);
  });

  it("ne compte qu'une fois un tag répété dans un même contenu", () => {
    const contents = [makeContent(["css", "CSS", "Css"], "a")];
    const [entry] = getTagIndex(contents);
    expect(entry?.count).toBe(1);
  });

  it("ignore les tags qui ne produisent aucun slug", () => {
    const contents = [makeContent(["***", "css"], "a")];
    expect(getTagIndex(contents).map((tag) => tag.slug)).toEqual([
      "css",
    ]);
  });
});

describe("getTagBySlug", () => {
  it("retrouve un tag par son slug", () => {
    const contents = [makeContent(["retour d'expérience"], "a")];
    expect(getTagBySlug(contents, "retour-d-experience")?.label).toBe(
      "retour d'expérience"
    );
  });

  it("renvoie null pour un slug inconnu", () => {
    expect(
      getTagBySlug([makeContent(["css"], "a")], "rust")
    ).toBeNull();
  });
});

describe("getContentByTagSlug", () => {
  it("garde l'ordre d'entrée", () => {
    const contents = [
      makeContent(["css"], "premier"),
      makeContent(["react"], "hors-sujet"),
      makeContent(["CSS"], "second"),
    ];

    expect(
      getContentByTagSlug(contents, "css").map(
        (content) => content.slug
      )
    ).toEqual(["premier", "second"]);
  });

  it("rassemble les variantes d'orthographe", () => {
    const contents = [
      makeContent(["Next.js"], "a"),
      makeContent(["next js"], "b"),
    ];

    expect(getContentByTagSlug(contents, "next-js")).toHaveLength(2);
  });
});

describe("tagLabel", () => {
  it("rend la clé telle quelle en français", () => {
    expect(tagLabel("carrière", "fr")).toBe("carrière");
    expect(tagLabel("retour d'expérience", "fr")).toBe(
      "retour d'expérience"
    );
  });

  it("traduit en anglais les sujets dont le mot diffère", () => {
    expect(tagLabel("carrière", "en")).toBe("career");
    expect(tagLabel("retour d'expérience", "en")).toBe(
      "lessons learned"
    );
    expect(tagLabel("couleurs", "en")).toBe("colors");
    expect(tagLabel("texte", "en")).toBe("text");
    expect(tagLabel("casse", "en")).toBe("case");
    expect(tagLabel("contraste", "en")).toBe("contrast");
  });

  it("laisse intacts les sujets identiques dans les deux langues", () => {
    for (const tag of [
      "css",
      "json",
      "jwt",
      "git",
      "regex",
      "uuid",
    ]) {
      expect(tagLabel(tag, "en")).toBe(tag);
    }
  });

  it("est insensible à la casse de la clé", () => {
    expect(tagLabel("Carrière", "en")).toBe("career");
    expect(tagLabel("TEXTE", "en")).toBe("text");
  });

  it("rend un sujet inconnu tel quel plutôt que vide", () => {
    expect(tagLabel("kubernetes", "en")).toBe("kubernetes");
    expect(tagLabel("", "en")).toBe("");
  });

  it("suppose le français sans locale", () => {
    expect(tagLabel("couleurs")).toBe("couleurs");
  });
});

describe("clé partagée entre les locales", () => {
  /**
   * La propriété qui compte : un sujet a le MÊME slug dans les deux arbres, donc
   * une URL de sujet partagée retombe sur le même contenu. C'est ce qui était
   * faux quand le frontmatter anglais traduisait la clé.
   */
  it("produit les mêmes slugs en français et en anglais", () => {
    const contents = [
      makeContent(["carrière", "retour d'expérience"], "post"),
    ];

    const fr = getTagIndex(contents, "fr").map((tag) => tag.slug);
    const en = getTagIndex(contents, "en").map((tag) => tag.slug);

    expect(en).toEqual(fr);
    expect(fr).toContain("carriere");
  });

  it("traduit le libellé sans toucher au slug", () => {
    const contents = [makeContent(["carrière"], "post")];
    const [entry] = getTagIndex(contents, "en");

    expect(entry.slug).toBe("carriere");
    expect(entry.label).toBe("career");
    expect(entry.variants).toEqual(["career"]);
  });

  it("retrouve un sujet par son slug partagé dans les deux locales", () => {
    const contents = [makeContent(["couleurs"], "post")];

    expect(getTagBySlug(contents, "couleurs", "fr")?.label).toBe(
      "couleurs"
    );
    expect(getTagBySlug(contents, "couleurs", "en")?.label).toBe(
      "colors"
    );
    // le slug anglais de l'ancien vocabulaire ne doit plus rien désigner
    expect(getTagBySlug(contents, "colors", "en")).toBeNull();
  });

  it("classe les sujets sur le libellé de la locale", () => {
    /**
     * Le couple est choisi pour que l'ordre CHANGE vraiment. La plupart des
     * traductions gardent l'initiale (`carrière`/`career`, `texte`/`text`) et
     * trieraient pareil dans les deux langues, ce qui ne prouverait rien : seul
     * « retour d'expérience » → « lessons learned » traverse l'alphabet, de R
     * vers L, et passe donc devant « mindset ».
     */
    const contents = [
      makeContent(["retour d'expérience"], "a"),
      makeContent(["mindset"], "b"),
    ];

    expect(
      getTagData(contents, "fr").tags.filter((t) => t !== ALL_TAG)
    ).toEqual(["mindset", "retour d'expérience"]);
    expect(
      getTagData(contents, "en").tags.filter((t) => t !== ALL_TAG)
    ).toEqual(["retour d'expérience", "mindset"]);
    expect(getTagData(contents, "fr").tags).toContain(ALL_TAG);
  });

  it("expose un libellé par clé, la clé restant la valeur du filtre", () => {
    const { tagLabels, tags } = getTagData(
      [makeContent(["couleurs", "css"], "post")],
      "en"
    );

    expect(tags).toContain("couleurs");
    expect(tags).not.toContain("colors");
    expect(tagLabels.couleurs).toBe("colors");
    expect(tagLabels.css).toBe("css");
  });
});
