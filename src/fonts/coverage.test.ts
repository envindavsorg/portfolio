import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  type CoverageFile,
  canDraw,
  codeSources,
  drawnCodePoints,
  formatCodePoint,
  fromRanges,
  readInventory,
  toRanges,
  wantedCodePoints,
} from "./coverage";

/**
 * Les polices servies sont taillées à ce que le site dessine
 * (`pnpm fonts:subset`). Un caractère ajouté ensuite à un message, à un
 * contenu ou au code n'a donc plus de glyphe, et le navigateur le dessine sans
 * rien dire dans la police du système : cela ne se voit qu'une fois en ligne,
 * au milieu d'une phrase.
 *
 * Ce test lit `coverage.json`, que le script écrit à côté des polices — aucun
 * fichier de police n'est décodé ici.
 */
const FONTS_DIR = "src/fonts";
const MONO = "geist/GeistMono-Variable.woff2";

const RERUN =
  "les polices ne couvrent plus le dépôt : lancer `pnpm fonts:subset` et valider ses sorties";

/**
 * Caractères des messages et des contenus qu'une police SOURCE n'a jamais
 * eus : la police du système les dessinait déjà avant la taille. Chaque ligne
 * dit pourquoi cela ne se voit pas.
 */
const NEVER_HAD: Record<string, readonly number[]> = {
  // Filets du schéma de `cron-explainer`, dans un bloc de code : c'est Geist
  // Mono qui dessine le code, et elle les a. Ni la sans ni les polices pixel
  // ne les rencontrent.
  boxDrawing: [0x25_00, 0x25_02, 0x25_0c],
};

const neverHad = (file: string): number[] =>
  file === MONO ? [] : [...(NEVER_HAD.boxDrawing ?? [])];

const COVERAGE: CoverageFile = JSON.parse(
  readFileSync(join(FONTS_DIR, "coverage.json"), "utf-8")
);
const ENTRIES = Object.entries(COVERAGE);
const INVENTORY = readInventory();

const sha256 = (path: string): string =>
  createHash("sha256")
    .update(readFileSync(join(FONTS_DIR, path)))
    .digest("hex");

const name = (codePoints: Iterable<number>): string[] =>
  [...codePoints]
    .sort((a, b) => a - b)
    .map(
      (codePoint) =>
        `${formatCodePoint(codePoint)} ${String.fromCodePoint(codePoint)}`
    );

/** ce que la source dessine et que la sortie ne dessine plus */
const lostBy = (
  entry: CoverageFile[string],
  codePoints: Iterable<number>
): number[] => {
  const source = fromRanges(entry.source.codePoints);
  const output = fromRanges(entry.codePoints);

  return [...codePoints].filter(
    (codePoint) =>
      canDraw(source, codePoint) && !canDraw(output, codePoint)
  );
};

describe("polices taillées", () => {
  it("les sept polices du site sont enregistrées", () => {
    expect(ENTRIES).toHaveLength(7);
  });

  it.each(ENTRIES)(
    "%s est le fichier que le script a écrit",
    (file, entry) => {
      expect(sha256(file), RERUN).toBe(entry.sha256);
      expect(sha256(entry.source.file), RERUN).toBe(
        entry.source.sha256
      );
      expect(readFileSync(join(FONTS_DIR, file)).byteLength).toBe(
        entry.bytes
      );
    }
  );

  it.each(ENTRIES)(
    "%s dessine tout ce que le dépôt écrit",
    (_, entry) => {
      expect(
        name(lostBy(entry, wantedCodePoints(INVENTORY))),
        RERUN
      ).toEqual([]);
    }
  );

  it.each(ENTRIES)(
    "%s : un caractère sans glyphe est une décision écrite",
    (file, entry) => {
      const source = fromRanges(entry.source.codePoints);
      const undrawn = [
        ...INVENTORY.messages,
        ...INVENTORY.content,
      ].filter((codePoint) => !canDraw(source, codePoint));

      expect(
        name(new Set(undrawn)),
        "la police source n'a pas ces caractères, ou la liste en nomme un qui ne sert plus : changer le caractère, ou tenir NEVER_HAD à jour avec sa raison"
      ).toEqual(name(neverHad(file)));
    }
  );

  it("aucune fonction OpenType n'est allumée à la main", () => {
    // Les fonctions hors de KEPT_FEATURES sont retirées des polices : une
    // déclaration explicite resterait sans effet, en silence.
    const declaration =
      /font-feature-settings|fontFeatureSettings|font-variant|fontVariant/u;
    const declared = codeSources().filter((path) =>
      declaration.test(readFileSync(path, "utf-8"))
    );

    expect(
      declared,
      "ajouter la fonction à KEPT_FEATURES, lancer `pnpm fonts:subset`, puis inscrire le fichier ici"
    ).toEqual([]);
  });

  it("l'axe de graisse de la mono reste entier", () => {
    // Limité à 300..900, il rendait 852 octets et 744 glyphes sur 5096
    // changeaient de pixels : `mono.ts` déclare donc toujours 100 à 900.
    expect(
      readFileSync(join(FONTS_DIR, "mono.ts"), "utf-8")
    ).toContain('weight: "100 900"');
  });

  // TÉMOINS : chaque garde voit ce qu'il doit voir
  it("un caractère nouveau que la source dessine est signalé", () => {
    const mono = COVERAGE[MONO];
    const cyrillic = 0x04_16;

    expect(mono).toBeDefined();
    if (mono) {
      expect(fromRanges(mono.source.codePoints).has(cyrillic)).toBe(
        true
      );
      expect(lostBy(mono, [cyrillic, 0x41])).toEqual([cyrillic]);
    }
  });

  it("une lettre se dessine aussi par sa base et son accent", () => {
    const withBreve = new Set([0x65, 0x03_06]);

    expect(canDraw(withBreve, 0x01_15)).toBe(true);
    expect(canDraw(new Set([0x65]), 0x01_15)).toBe(false);
    expect(canDraw(new Set([0x03_06]), 0x41)).toBe(false);
  });

  it("les échappements comptent comme les caractères", () => {
    const found = drawnCodePoints(
      String.raw`a b\u{1F600}c😀&nbsp;&#8594;&#x2192;&inconnue;`
    );

    for (const codePoint of [0x20_2f, 0x1_f6_00, 0xa0, 0x21_92]) {
      expect(found.has(codePoint)).toBe(true);
    }
    expect(drawnCodePoints("a\tb\n").has(0x09)).toBe(false);
  });

  it("les plages se relisent à l'identique", () => {
    const codePoints = [0x20, 0x21, 0x22, 0x41, 0x20_2f, 0x1_f6_00];

    expect(toRanges(codePoints)).toEqual([
      "0020-0022",
      "0041",
      "202F",
      "1F600",
    ]);
    expect([...fromRanges(toRanges(codePoints))]).toEqual(codePoints);
  });
});
