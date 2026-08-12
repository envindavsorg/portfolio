import { describe, expect, it } from "vitest";

import {
  convertCase,
  convertLines,
  slugify,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toWords,
} from "@/lib/case";

describe("toWords", () => {
  it("découpe le camelCase et le PascalCase", () => {
    expect(toWords("getUserName")).toEqual(["get", "user", "name"]);
    expect(toWords("GetUserName")).toEqual(["get", "user", "name"]);
  });

  it("garde les acronymes entiers", () => {
    expect(toWords("HTTPServerError")).toEqual([
      "http",
      "server",
      "error",
    ]);
    expect(toWords("parseJSON")).toEqual(["parse", "json"]);
  });

  it("sépare les chiffres des lettres", () => {
    expect(toWords("version2Beta")).toEqual(["version", "2", "beta"]);
  });

  it("traite tirets, soulignés et ponctuation comme des séparateurs", () => {
    expect(toWords("mon-super_texte.final")).toEqual([
      "mon",
      "super",
      "texte",
      "final",
    ]);
  });

  it("retire les accents", () => {
    expect(toWords("Créer un élément")).toEqual([
      "creer",
      "un",
      "element",
    ]);
  });

  it("ne renvoie rien pour une chaîne sans lettre ni chiffre", () => {
    expect(toWords("   ---   ")).toEqual([]);
    expect(toWords("")).toEqual([]);
  });
});

describe("conversions", () => {
  const source = "Créer un élément HTML";

  it("produit chaque casse attendue", () => {
    expect(toCamelCase(source)).toBe("creerUnElementHtml");
    expect(toPascalCase(source)).toBe("CreerUnElementHtml");
    expect(toSnakeCase(source)).toBe("creer_un_element_html");
    expect(toKebabCase(source)).toBe("creer-un-element-html");
    expect(toConstantCase(source)).toBe("CREER_UN_ELEMENT_HTML");
    expect(toTitleCase(source)).toBe("Creer Un Element Html");
    expect(toSentenceCase(source)).toBe("Creer un element html");
  });

  it("renvoie une chaîne vide plutôt que de planter", () => {
    expect(toCamelCase("!!!")).toBe("");
    expect(toSentenceCase("")).toBe("");
    expect(toPascalCase("   ")).toBe("");
  });

  it("est idempotent sur son propre résultat", () => {
    expect(toKebabCase(toKebabCase(source))).toBe(
      toKebabCase(source)
    );
    expect(toCamelCase(toCamelCase(source))).toBe(
      toCamelCase(source)
    );
    expect(toSnakeCase(toSnakeCase(source))).toBe(
      toSnakeCase(source)
    );
  });
});

describe("slugify", () => {
  it("fait de la ponctuation un séparateur", () => {
    expect(slugify("a / b")).toBe("a-b");
    expect(slugify("Next.js")).toBe("next-js");
  });

  it("ne laisse pas de tiret en bord", () => {
    expect(slugify("  — Accessibilité !  ")).toBe("accessibilite");
  });
});

describe("convertCase", () => {
  it("expose upper et lower sans toucher à la structure", () => {
    expect(convertCase("Hello World", "upper")).toBe("HELLO WORLD");
    expect(convertCase("Hello World", "lower")).toBe("hello world");
  });
});

describe("convertLines", () => {
  it("convertit chaque ligne séparément", () => {
    expect(convertLines("mon champ\nautre champ", "camel")).toBe(
      "monChamp\nautreChamp"
    );
  });

  it("préserve les lignes vides", () => {
    expect(convertLines("un\n\ndeux", "kebab")).toBe("un\n\ndeux");
  });

  it("ne fusionne jamais deux lignes", () => {
    const result = convertLines(
      "premier\nsecond\ntroisieme",
      "pascal"
    );
    expect(result.split("\n")).toHaveLength(3);
    expect(result).toBe("Premier\nSecond\nTroisieme");
  });
});
