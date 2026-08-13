import { describe, expect, it } from "vitest";

import type { SearchDoc } from "./search";
import {
  editDistance,
  fuzzyMatches,
  normalize,
  SCORES,
  scoreText,
  searchableText,
  searchDocs,
  toPlainText,
} from "./search";

describe("toPlainText", () => {
  it("drops fenced code blocks entirely", () => {
    const mdx = "avant\n\n```ts\nconst secret = 42;\n```\n\napres";
    const text = toPlainText(mdx);

    expect(text).toContain("avant");
    expect(text).toContain("apres");
    expect(text).not.toContain("secret");
  });

  it("drops inline code and MDX components", () => {
    expect(toPlainText("un `useEffect` ici")).toBe("un ici");
    expect(toPlainText("texte <Base64Utils /> suite")).toBe(
      "texte suite"
    );
  });

  it("keeps link labels but drops urls", () => {
    const text = toPlainText(
      "voir [la doc Next.js](https://nextjs.org)"
    );

    expect(text).toContain("la doc Next.js");
    expect(text).not.toContain("nextjs.org");
  });

  it("drops images completely", () => {
    expect(toPlainText("![une banniere](/images/x.webp)")).toBe("");
  });

  it("strips heading, emphasis and bullet markers", () => {
    const text = toPlainText(
      "# Titre\n\n**gras** et _italique_\n\n- item"
    );

    expect(text).toBe("Titre gras et italique item");
  });

  it("collapses whitespace", () => {
    expect(toPlainText("a\n\n\n   b\t\tc")).toBe("a b c");
  });
});

describe("normalize", () => {
  it("lowercases and removes diacritics", () => {
    expect(normalize("Réseau ÉLECTRIQUE")).toBe("reseau electrique");
  });

  it("lets an unaccented query match accented text", () => {
    expect(normalize("dépôt").includes(normalize("depot"))).toBe(
      true
    );
  });
});

describe("searchableText", () => {
  const doc: SearchDoc = {
    category: "articles",
    description: "Comment je structure mes feuilles de style",
    excerpt: "Le corps de l'article parle de cascade et de calques.",
    headings: ["Les couches", "Le nommage"],
    slug: "how-i-write-css",
    tags: ["css", "tailwind"],
    title: "Comment j'écris du CSS",
  };

  it("indexes title, description, tags, headings and excerpt", () => {
    const text = searchableText(doc);

    for (const needle of [
      "css",
      "tailwind",
      "couches",
      "nommage",
      "cascade",
      "feuilles de style",
      "articles",
    ]) {
      expect(text).toContain(needle);
    }
  });

  it("is searchable without accents", () => {
    // « j'écris » doit se trouver en tapant « ecris »
    expect(searchableText(doc)).toContain("ecris");
  });
});

describe("scoreText", () => {
  it("classe un titre exact au-dessus d'un titre partiel", () => {
    expect(scoreText("css", "", "css")).toBe(SCORES.exactTitle);
    expect(scoreText("le css moderne", "", "css")).toBe(SCORES.title);
  });

  it("classe le contenu en dessous du titre", () => {
    expect(scoreText("un titre", "du css dedans", "css")).toBe(
      SCORES.content
    );
  });

  it("ne renvoie rien sans correspondance", () => {
    expect(scoreText("un titre", "du contenu", "rust")).toBe(
      SCORES.none
    );
  });

  it("ignore les accents des deux côtés", () => {
    expect(scoreText("Comment j'écris du CSS", "", "ecris")).toBe(
      SCORES.title
    );
    expect(scoreText("un titre", "réseau local", "reseau")).toBe(
      SCORES.content
    );
  });

  it("accepte tout pour une requête vide", () => {
    // sinon la palette n'afficherait rien à l'ouverture
    expect(scoreText("un titre", "", "")).toBe(SCORES.exactTitle);
    expect(scoreText("un titre", "", "   ")).toBe(SCORES.exactTitle);
  });
});

const makeDoc = (
  slug: string,
  title: string,
  excerpt = ""
): SearchDoc => ({
  category: "articles",
  description: "",
  excerpt,
  headings: [],
  slug,
  tags: [],
  title,
});

describe("searchDocs", () => {
  it("écarte les documents sans correspondance", () => {
    const hits = searchDocs(
      [
        makeDoc("a", "Le CSS moderne"),
        makeDoc("b", "Rust en production"),
      ],
      "css"
    );

    expect(hits.map((hit) => hit.doc.slug)).toEqual(["a"]);
  });

  it("place les correspondances de titre avant celles de contenu", () => {
    const hits = searchDocs(
      [
        makeDoc("contenu", "Autre sujet", "il y a du css ici"),
        makeDoc("titre", "Le CSS moderne"),
      ],
      "css"
    );

    expect(hits.map((hit) => hit.doc.slug)).toEqual([
      "titre",
      "contenu",
    ]);
  });

  it("conserve l'ordre d'entrée à score égal", () => {
    // getAllContent trie par date décroissante : le plus récent doit rester devant
    const hits = searchDocs(
      [
        makeDoc("recent", "CSS et grilles"),
        makeDoc("ancien", "CSS et flexbox"),
      ],
      "css"
    );

    expect(hits.map((hit) => hit.doc.slug)).toEqual([
      "recent",
      "ancien",
    ]);
  });

  it("renvoie tout pour une requête vide", () => {
    const docs = [makeDoc("a", "Un"), makeDoc("b", "Deux")];
    expect(searchDocs(docs, "")).toHaveLength(2);
  });
});

describe("editDistance", () => {
  /**
   * Valeurs de référence calculées hors de ce code : distances de
   * Damerau-Levenshtein restreinte (alignement optimal), vérifiables à la main
   * sur des chaînes aussi courtes.
   */
  it("vaut zéro pour deux chaînes identiques", () => {
    expect(editDistance("tailwind", "tailwind")).toBe(0);
    expect(editDistance("", "")).toBe(0);
  });

  it("compte une chaîne vide comme la longueur de l'autre", () => {
    expect(editDistance("", "css")).toBe(3);
    expect(editDistance("css", "")).toBe(3);
  });

  it("compte une substitution, une insertion, une suppression", () => {
    expect(editDistance("chat", "chut")).toBe(1);
    expect(editDistance("chat", "chats")).toBe(1);
    expect(editDistance("chats", "chat")).toBe(1);
  });

  /** le cas qui motive l'algorithme : deux lettres inversées */
  it("compte une transposition pour UNE faute, pas deux", () => {
    expect(editDistance("tailwnid", "tailwind")).toBe(1);
    expect(editDistance("recherche", "rehcerche")).toBe(1);
  });

  it("est symétrique", () => {
    expect(editDistance("tailwnid", "tailwind")).toBe(
      editDistance("tailwind", "tailwnid")
    );
  });

  it("compte deux fautes indépendantes", () => {
    expect(editDistance("tialwnid", "tailwind")).toBe(2);
  });
});

describe("fuzzyMatches", () => {
  it("rapproche une faute de frappe d'un mot long", () => {
    expect(fuzzyMatches("un article sur tailwind", "tailwnid")).toBe(
      true
    );
  });

  it("ne tolère aucune faute sur un mot court", () => {
    // sinon « css » couvrirait « csv », « cs », « css »… et noierait la liste
    expect(fuzzyMatches("un fichier csv", "css")).toBe(false);
    expect(fuzzyMatches("du code css", "css")).toBe(true);
  });

  it("ignore l'ordre des mots", () => {
    expect(fuzzyMatches("tailwind et css", "css tailwind")).toBe(
      true
    );
  });

  it("exige que TOUS les mots de la requête se retrouvent", () => {
    expect(fuzzyMatches("tailwind et css", "css tailwind zig")).toBe(
      false
    );
  });

  it("reste insensible aux accents et à la casse", () => {
    expect(fuzzyMatches("Retour d'Expérience", "experience")).toBe(
      true
    );
  });

  it("rend faux sur une requête ou un texte vide", () => {
    expect(fuzzyMatches("un texte", "")).toBe(false);
    expect(fuzzyMatches("", "tailwind")).toBe(false);
    expect(fuzzyMatches("un texte", "   ")).toBe(false);
  });
});

const doc = (title: string, excerpt: string): SearchDoc => ({
  category: "articles",
  description: "",
  excerpt,
  headings: [],
  slug: title.toLowerCase().replaceAll(" ", "-"),
  tags: [],
  title,
});

describe("tolérance aux fautes dans le classement", () => {
  it("trouve un document malgré une faute de frappe", () => {
    const hits = searchDocs([doc("Tailwind", "du css")], "tailwnid");

    expect(hits).toHaveLength(1);
    expect(hits[0].score).toBe(SCORES.fuzzyTitle);
  });

  /**
   * La garantie qui rend la recherche prévisible : l'approximatif ne déplace
   * jamais l'exact, quel que soit le champ touché.
   */
  it("classe toute correspondance exacte devant toute correspondance approchée", () => {
    const exact = doc("Notes", "il est question de tailwind ici");
    const approximate = doc("Tailwnid", "rien à voir");

    const hits = searchDocs([approximate, exact], "tailwind");

    expect(hits.map((hit) => hit.doc.title)).toEqual([
      "Notes",
      "Tailwnid",
    ]);
    expect(SCORES.content).toBeGreaterThan(SCORES.fuzzyTitle);
    expect(SCORES.fuzzyTitle).toBeGreaterThan(SCORES.fuzzyContent);
  });

  it("ne rend rien pour une requête qui ne ressemble à rien", () => {
    expect(
      searchDocs([doc("Tailwind", "du css")], "zzzzzzzz")
    ).toEqual([]);
  });
});
