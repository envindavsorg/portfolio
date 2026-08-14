import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  checkMessages,
  isBlocking,
  placeholders,
  serializeMessages,
} from "@/lib/admin/messages";

const read = (locale: string): Record<string, string> =>
  JSON.parse(
    readFileSync(
      join(process.cwd(), `messages/${locale}.json`),
      "utf8"
    )
  );

describe("serializeMessages", () => {
  /**
   * L'aller-retour sur les VRAIS fichiers.
   *
   * Un éditeur de traductions réécrit `messages/{fr,en}.json` en entier. Si la
   * sérialisation ne reproduit pas exactement le format du dépôt, le premier
   * enregistrement produit un diff de 627 lignes sans qu'aucune valeur ne change.
   */
  it("reproduit les fichiers du dépôt à l'octet près", () => {
    for (const locale of ["fr", "en"]) {
      const path = join(process.cwd(), `messages/${locale}.json`);
      const original = readFileSync(path, "utf8");

      expect(
        serializeMessages(JSON.parse(original)),
        `messages/${locale}.json doit être reproduit tel quel`
      ).toBe(original);
    }
  });

  it("trie les clés et garde $schema en tête", () => {
    const output = serializeMessages({
      $schema: "https://inlang.com/schema/inlang-message-format",
      alpha: "a",
      zebre: "z",
    });

    const keys = [...output.matchAll(/"([^"]+)":/gu)].map(
      (match) => match[1]
    );

    expect(keys).toEqual(["$schema", "alpha", "zebre"]);
  });

  it("termine par un saut de ligne", () => {
    expect(serializeMessages({ a: "b" }).endsWith("}\n")).toBe(true);
  });
});

describe("placeholders", () => {
  it("relève les interpolations nommées", () => {
    expect(placeholders("{words} mots")).toEqual(["words"]);
    expect(placeholders("{count} contribution{plural}")).toEqual([
      "count",
      "plural",
    ]);
    expect(
      placeholders(
        "graphique des {totalCount} contributions de {year}"
      )
    ).toEqual(["totalCount", "year"]);
  });

  it("dédoublonne", () => {
    expect(placeholders("{a} puis {a} encore")).toEqual(["a"]);
  });

  /** une accolade littérale d'un exemple de code n'est pas une interpolation */
  it("ignore ce qui n'est pas un nom d'interpolation", () => {
    expect(placeholders("un objet vide s'écrit {}")).toEqual([]);
    expect(placeholders("{ espace }")).toEqual([]);
    expect(placeholders("{1}")).toEqual([]);
    expect(placeholders("aucune accolade")).toEqual([]);
  });

  it("trouve toutes les interpolations des vrais messages français", () => {
    const french = read("fr");

    // garde de non-régression : si ce compte tombe à zéro, la regex a cassé
    const withPlaceholders = Object.entries(french).filter(
      ([key, value]) =>
        key !== "$schema" && placeholders(value).length > 0
    );

    expect(withPlaceholders.length).toBeGreaterThan(50);
  });
});

describe("checkMessages", () => {
  /**
   * LE défaut que ce module existe pour attraper.
   *
   * Une traduction qui perd son `{words}` ne casse rien : Paraglide rend la
   * phrase sans le nombre, et personne ne le voit avant de relire la page
   * anglaise.
   */
  it("signale une interpolation perdue en traduisant", () => {
    const findings = checkMessages(
      { home_articles_item_words: "{words} mots" },
      { home_articles_item_words: "words" }
    );

    expect(findings).toEqual([
      {
        detail: "la traduction anglaise ne reprend pas {words}",
        key: "home_articles_item_words",
        kind: "interpolation-manquante",
      },
    ]);
  });

  it("signale une interpolation inventée dans la traduction", () => {
    const findings = checkMessages(
      { cle: "bonjour" },
      { cle: "hello {name}" }
    );

    expect(findings[0].kind).toBe("interpolation-inconnue");
  });

  /**
   * `compile-i18n.mts` compte les clés FRANÇAISES : une clé anglaise orpheline
   * fait échouer le build, l'inverse non.
   */
  it("signale une clé qui n'existe qu'en anglais", () => {
    const findings = checkMessages({}, { orpheline: "orphan" });

    expect(findings).toEqual([
      {
        detail:
          "présente en anglais seulement : la compilation i18n compte les clés françaises et échouerait",
        key: "orpheline",
        kind: "cle-absente-en-francais",
      },
    ]);
  });

  it("distingue une traduction à faire d'une erreur", () => {
    const findings = checkMessages({ cle: "bonjour" }, {});

    expect(findings[0].kind).toBe("traduction-absente");
    expect(isBlocking(findings[0])).toBe(false);
  });

  it("ignore la clé de schéma", () => {
    expect(
      checkMessages(
        { $schema: "https://inlang.com/x" },
        { $schema: "https://inlang.com/x" }
      )
    ).toEqual([]);
  });

  it("ne signale rien quand les interpolations correspondent", () => {
    expect(
      checkMessages(
        { cle: "{count} contribution{plural}" },
        { cle: "{count} contribution{plural}" }
      )
    ).toEqual([]);
  });

  it("tolère un ordre d'interpolation différent", () => {
    // une langue peut inverser l'ordre des mots : seul l'ENSEMBLE compte
    expect(
      checkMessages(
        { cle: "{label} le {date}" },
        { cle: "on {date}: {label}" }
      )
    ).toEqual([]);
  });

  /**
   * L'état réel du dépôt. Ce test échoue si une traduction perd une
   * interpolation — y compris par une édition faite en dehors de l'espace admin.
   */
  it("les vrais fichiers n'ont aucun désaccord d'interpolation", () => {
    const blocking = checkMessages(read("fr"), read("en")).filter(
      isBlocking
    );

    expect(blocking).toEqual([]);
  });
});
