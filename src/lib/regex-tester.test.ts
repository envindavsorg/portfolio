import { describe, expect, it } from "vitest";

import {
  applyReplacement,
  compileRegex,
  findMatches,
  MAX_MATCHES,
  toSegments,
} from "@/lib/regex-tester";

const compile = (pattern: string, flags = "g"): RegExp => {
  const result = compileRegex(pattern, flags);
  if (!result.ok) {
    throw new Error(
      `${pattern} devrait compiler : ${result.message}`
    );
  }
  return result.regex;
};

describe("compileRegex", () => {
  it("compile un motif valide", () => {
    expect(compileRegex("\\d+", "g").ok).toBe(true);
  });

  it("force le drapeau g", () => {
    const result = compileRegex("\\d+", "i");
    expect(result.ok).toBe(true);

    if (result.ok) {
      // sans g, exec repartirait de zéro et la recherche boucherait sur la première
      expect(result.regex.flags).toContain("g");
      expect(result.regex.flags).toContain("i");
    }
  });

  it("ne double pas g quand il est déjà là", () => {
    const result = compileRegex("a", "gi");
    if (result.ok) {
      expect(result.regex.flags).toBe("gi");
    }
  });

  it("renvoie le message d'erreur du moteur", () => {
    const result = compileRegex("(non fermé", "g");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBeTruthy();
    }
  });

  it("refuse un drapeau inconnu", () => {
    expect(compileRegex("a", "z").ok).toBe(false);
  });
});

describe("findMatches", () => {
  it("trouve toutes les correspondances avec leur position", () => {
    const { matches } = findMatches(compile("\\d+"), "a1bb22ccc333");

    expect(matches.map((match) => match.value)).toEqual([
      "1",
      "22",
      "333",
    ]);
    expect(matches.map((match) => match.index)).toEqual([1, 4, 9]);
  });

  it("expose les groupes numérotés", () => {
    const { matches } = findMatches(
      compile("(\\w+)@(\\w+)"),
      "moi@exemple"
    );

    expect(matches[0]?.groups).toEqual(["moi", "exemple"]);
  });

  it("expose les groupes nommés", () => {
    const { matches } = findMatches(
      compile("(?<annee>\\d{4})-(?<mois>\\d{2})"),
      "2026-08"
    );

    expect(matches[0]?.named).toEqual({
      annee: "2026",
      mois: "08",
    });
  });

  it("laisse undefined un groupe non participant", () => {
    const { matches } = findMatches(compile("(a)|(b)"), "b");

    expect(matches[0]?.groups).toEqual([undefined, "b"]);
  });

  it("ne boucle pas sur une correspondance vide", () => {
    // `a*` correspond à la chaîne vide entre chaque caractère : sans avancée
    // forcée de lastIndex, exec renverrait indéfiniment la même position
    const { matches, truncated } = findMatches(compile("a*"), "bbb");

    expect(truncated).toBe(false);
    expect(matches.length).toBeLessThan(10);
    expect(matches.every((match) => match.value === "")).toBe(true);
  });

  it("s'arrête à la limite et le signale", () => {
    const { matches, truncated } = findMatches(
      compile("a"),
      "a".repeat(MAX_MATCHES + 50)
    );

    expect(matches).toHaveLength(MAX_MATCHES);
    expect(truncated).toBe(true);
  });

  it("ne renvoie rien quand rien ne correspond", () => {
    const { matches, truncated } = findMatches(
      compile("\\d+"),
      "aucun chiffre"
    );

    expect(matches).toEqual([]);
    expect(truncated).toBe(false);
  });

  it("repart de zéro à chaque appel", () => {
    const regex = compile("\\d");
    const first = findMatches(regex, "1 2 3");
    const second = findMatches(regex, "1 2 3");

    // un lastIndex partagé entre deux appels ferait manquer des correspondances
    expect(second.matches).toEqual(first.matches);
  });
});

describe("toSegments", () => {
  it("alterne texte et correspondances", () => {
    const text = "a1bb22";
    const { matches } = findMatches(compile("\\d+"), text);

    expect(toSegments(text, matches)).toEqual([
      { isMatch: false, text: "a" },
      { isMatch: true, matchIndex: 0, text: "1" },
      { isMatch: false, text: "bb" },
      { isMatch: true, matchIndex: 1, text: "22" },
    ]);
  });

  it("recompose exactement le texte d'origine", () => {
    const text = "un 12 deux 345 trois";
    const { matches } = findMatches(compile("\\d+"), text);

    expect(
      toSegments(text, matches)
        .map((segment) => segment.text)
        .join("")
    ).toBe(text);
  });

  it("ignore les correspondances vides", () => {
    const text = "bbb";
    const { matches } = findMatches(compile("a*"), text);

    expect(toSegments(text, matches)).toEqual([
      { isMatch: false, text: "bbb" },
    ]);
  });

  it("gère une correspondance qui couvre tout le texte", () => {
    const text = "1234";
    const { matches } = findMatches(compile("\\d+"), text);

    expect(toSegments(text, matches)).toEqual([
      { isMatch: true, matchIndex: 0, text: "1234" },
    ]);
  });
});

describe("applyReplacement", () => {
  it("remplace avec des références numérotées", () => {
    const result = applyReplacement(
      compile("(\\w+)@(\\w+)"),
      "moi@exemple",
      "$2:$1"
    );

    expect(result).toEqual({ ok: true, result: "exemple:moi" });
  });

  it("remplace avec des références nommées", () => {
    const result = applyReplacement(
      compile("(?<annee>\\d{4})-(?<mois>\\d{2})"),
      "2026-08",
      "$<mois>/$<annee>"
    );

    expect(result).toEqual({ ok: true, result: "08/2026" });
  });

  it("efface silencieusement une référence nommée inexistante", () => {
    // comportement de la spécification, pas une erreur : `$<inconnu>` sur un
    // motif QUI A des groupes nommés produit une chaîne vide, sans rien lever
    const result = applyReplacement(
      compile("(?<annee>\\d{4})"),
      "2026",
      "[$<inconnu>]"
    );

    expect(result).toEqual({ ok: true, result: "[]" });
  });

  it("recopie littéralement $<nom> sans groupe nommé", () => {
    const result = applyReplacement(
      compile("\\d{4}"),
      "2026",
      "$<annee>"
    );

    expect(result).toEqual({ ok: true, result: "$<annee>" });
  });
});
