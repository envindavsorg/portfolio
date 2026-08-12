import { describe, expect, it } from "vitest";

import type { SearchDoc } from "./search";
import {
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
