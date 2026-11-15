import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";

import subsetFont from "subset-font";

import {
  type CoverageFile,
  canDraw,
  formatCodePoint,
  KEPT_FEATURES,
  keptCodePoints,
  readInventory,
  toRanges,
  wantedCodePoints,
} from "@/fonts/coverage";

/**
 * Taille les polices du site à ce qu'il dessine : `pnpm fonts:subset`.
 *
 * Les originaux sont dans `src/fonts/source/` et ne sont jamais importés par
 * l'application ; les sorties gardent leur nom, les déclarations
 * `localFont()` ne bougent donc pas. Le jeu de caractères est calculé par
 * `src/fonts/coverage.ts`, et `src/fonts/coverage.json` enregistre ce qui a
 * été écrit : `coverage.test.ts` s'en sert pour refuser un caractère ajouté
 * depuis, ou un fichier modifié à la main.
 *
 * Un texte qui n'est pas dans le dépôt — ce qu'un visiteur tape dans un outil,
 * ce que GitHub renvoie — et qui sort du latin gardé est dessiné par la police
 * du système. C'est le prix accepté.
 */
const FONTS_DIR = "src/fonts";
const SOURCE_DIR = "source";
const COVERAGE_FILE = join(FONTS_DIR, "coverage.json");

const FILES = [
  "geist/GeistMono-Variable.woff2",
  "geist/Geist-Variable.woff2",
  "geist-pixel/GeistPixel-Circle.woff2",
  "geist-pixel/GeistPixel-Grid.woff2",
  "geist-pixel/GeistPixel-Line.woff2",
  "geist-pixel/GeistPixel-Square.woff2",
  "geist-pixel/GeistPixel-Triangle.woff2",
] as const;

/**
 * La licence (13) et son adresse (14) restent dans la table `name` : l'OFL
 * demande qu'elle accompagne la police, et le fichier servi voyage seul.
 * HarfBuzz les retire d'office ; les garder coûte 100 à 240 octets par
 * fichier.
 */
const LICENCE_NAME_IDS = [13, 14];

/**
 * Seule fonction OpenType que le CSS allume en plus de celles du navigateur
 * (`tabular-nums`) : le script s'arrête si une police qui l'avait la perd.
 * Les autres fonctions gardées peuvent manquer à une sortie sans que rien ne
 * change à l'écran : HarfBuzz retire une fonction quand aucun des glyphes
 * qu'elle touche ne reste.
 */
const CSS_FEATURES = ["tnum"];

type Tables = Map<string, Buffer>;

const UINT16 = 0x1_00_00;

/** Les étiquettes connues du format WOFF2, dans l'ordre de sa spécification. */
const KNOWN_TAGS = [
  "cmap",
  "head",
  "hhea",
  "hmtx",
  "maxp",
  "name",
  "OS/2",
  "post",
  "cvt ",
  "fpgm",
  "glyf",
  "loca",
  "prep",
  "CFF ",
  "VORG",
  "EBDT",
  "EBLC",
  "gasp",
  "hdmx",
  "kern",
  "LTSH",
  "PCLT",
  "VDMX",
  "vhea",
  "vmtx",
  "BASE",
  "GDEF",
  "GPOS",
  "GSUB",
  "EBSC",
  "JSTF",
  "MATH",
  "CBDT",
  "CBLC",
  "COLR",
  "CPAL",
  "SVG ",
  "sbix",
  "acnt",
  "avar",
  "bdat",
  "bloc",
  "bsln",
  "cvar",
  "fdsc",
  "feat",
  "fmtx",
  "fvar",
  "gvar",
  "hsty",
  "just",
  "lcar",
  "mort",
  "morx",
  "opbd",
  "prop",
  "trak",
  "Zapf",
  "Silf",
  "Glat",
  "Gloc",
  "Feat",
  "Sill",
];

const WOFF2_HEADER = 48;
const ARBITRARY_TAG = 63;
const TAG_BITS = 0x40;
const CONTINUES = 0x80;

/**
 * Les tables d'un fichier WOFF2, lues dans le fichier même : c'est ce que le
 * navigateur reçoit, pas un intermédiaire. Les tables transformées par le
 * format (`glyf`, `loca`, parfois `hmtx`) sont laissées de côté — le script
 * ne lit que des tables stockées telles quelles.
 */
const readTables = (woff2: Buffer): Tables => {
  if (woff2.toString("latin1", 0, 4) !== "wOF2") {
    throw new Error("ce fichier n'est pas un WOFF2");
  }

  const count = woff2.readUInt16BE(12);
  const entries: { length: number; stored: boolean; tag: string }[] =
    [];
  let at = WOFF2_HEADER;

  const readBase128 = (): number => {
    let value = 0;
    for (;;) {
      const byte = woff2.readUInt8(at);
      at += 1;
      value = value * CONTINUES + (byte % CONTINUES);
      if (byte < CONTINUES) {
        return value;
      }
    }
  };

  for (let index = 0; index < count; index += 1) {
    const flags = woff2.readUInt8(at);
    at += 1;
    const known = flags % TAG_BITS;
    const version = Math.floor(flags / TAG_BITS);
    let tag = KNOWN_TAGS[known];
    if (known === ARBITRARY_TAG || tag === undefined) {
      tag = woff2.toString("latin1", at, at + 4);
      at += 4;
    }

    const original = readBase128();
    const transformed =
      tag === "glyf" || tag === "loca"
        ? version === 0
        : version !== 0;
    entries.push({
      length: transformed ? readBase128() : original,
      stored: !transformed,
      tag,
    });
  }

  const data = brotliDecompressSync(
    woff2.subarray(at, at + woff2.readUInt32BE(20))
  );
  const tables: Tables = new Map();
  let offset = 0;

  for (const entry of entries) {
    if (entry.stored) {
      tables.set(
        entry.tag,
        data.subarray(offset, offset + entry.length)
      );
    }
    offset += entry.length;
  }
  if (offset !== data.byteLength) {
    throw new Error(
      "WOFF2 : la somme des tables n'est pas celle du flux"
    );
  }

  return tables;
};

const requireTable = (tables: Tables, tag: string): Buffer => {
  const table = tables.get(tag);
  if (!table) {
    throw new Error(`table ${tag} absente`);
  }
  return table;
};

const readCmapFormat4 = (
  cmap: Buffer,
  at: number,
  into: Set<number>
) => {
  const segments = cmap.readUInt16BE(at + 6) / 2;
  const ends = at + 14;
  const starts = ends + segments * 2 + 2;
  const deltas = starts + segments * 2;
  const offsets = deltas + segments * 2;

  for (let segment = 0; segment < segments; segment += 1) {
    const first = cmap.readUInt16BE(starts + segment * 2);
    const last = cmap.readUInt16BE(ends + segment * 2);
    const delta = cmap.readUInt16BE(deltas + segment * 2);
    const offsetAt = offsets + segment * 2;
    const rangeOffset = cmap.readUInt16BE(offsetAt);

    for (
      let codePoint = first;
      codePoint <= last && codePoint !== 0xff_ff;
      codePoint += 1
    ) {
      const raw =
        rangeOffset === 0
          ? codePoint
          : cmap.readUInt16BE(
              offsetAt + rangeOffset + (codePoint - first) * 2
            );
      const glyph =
        rangeOffset !== 0 && raw === 0 ? 0 : (raw + delta) % UINT16;
      if (glyph !== 0) {
        into.add(codePoint);
      }
    }
  }
};

const readCmapFormat12 = (
  cmap: Buffer,
  at: number,
  into: Set<number>
) => {
  const groups = cmap.readUInt32BE(at + 12);

  for (let group = 0; group < groups; group += 1) {
    const record = at + 16 + group * 12;
    const first = cmap.readUInt32BE(record);
    const last = cmap.readUInt32BE(record + 4);
    const glyph = cmap.readUInt32BE(record + 8);

    for (let codePoint = first; codePoint <= last; codePoint += 1) {
      if (glyph + (codePoint - first) !== 0) {
        into.add(codePoint);
      }
    }
  }
};

const UNICODE_PLATFORM = 0;
const WINDOWS_PLATFORM = 3;
const WINDOWS_UNICODE_ENCODINGS = new Set([1, 10]);
const VARIATION_SEQUENCES = 14;

/** Les points de code qu'une police sait dessiner, lus dans sa table `cmap`. */
const readCodePoints = (tables: Tables): Set<number> => {
  const cmap = requireTable(tables, "cmap");
  const codePoints = new Set<number>();
  const count = cmap.readUInt16BE(2);

  for (let index = 0; index < count; index += 1) {
    const record = 4 + index * 8;
    const platform = cmap.readUInt16BE(record);
    const isUnicode =
      platform === UNICODE_PLATFORM ||
      (platform === WINDOWS_PLATFORM &&
        WINDOWS_UNICODE_ENCODINGS.has(cmap.readUInt16BE(record + 2)));
    const at = cmap.readUInt32BE(record + 4);
    const format = cmap.readUInt16BE(at);

    if (!isUnicode || format === VARIATION_SEQUENCES) {
      continue;
    }
    if (format === 4) {
      readCmapFormat4(cmap, at, codePoints);
    } else if (format === 12) {
      readCmapFormat12(cmap, at, codePoints);
    } else {
      throw new Error(
        `cmap au format ${format} : non lu par ce script`
      );
    }
  }

  return codePoints;
};

/** Les étiquettes de fonctions d'une table GSUB ou GPOS. */
const readFeatures = (tables: Tables): string[] => {
  const tags = new Set<string>();

  for (const table of [tables.get("GSUB"), tables.get("GPOS")]) {
    if (!table) {
      continue;
    }
    const list = table.readUInt16BE(6);
    const count = table.readUInt16BE(list);
    for (let index = 0; index < count; index += 1) {
      const record = list + 2 + index * 6;
      tags.add(table.toString("latin1", record, record + 4));
    }
  }

  return [...tags].sort();
};

const FIXED = 0x1_00_00;

const readAxes = (tables: Tables): string[] => {
  const fvar = tables.get("fvar");
  if (!fvar) {
    return [];
  }

  const start = fvar.readUInt16BE(4);
  const count = fvar.readUInt16BE(8);
  const size = fvar.readUInt16BE(10);

  return Array.from({ length: count }, (_, index) => {
    const record = start + index * size;
    const [min, initial, max] = [4, 8, 12].map(
      (field) => fvar.readInt32BE(record + field) / FIXED
    );
    return `${fvar.toString("latin1", record, record + 4)} ${min}..${max} (défaut ${initial})`;
  });
};

const USE_TYPO_METRICS = 0x80;

/**
 * Tout ce dont un navigateur tire la hauteur d'une ligne. La boîte du titre
 * pixel est gardée par `e2e/load-stability.spec.ts` : ces nombres ne bougent
 * pas d'une unité.
 */
const readVerticalMetrics = (
  tables: Tables
): Record<string, number> => {
  const hhea = requireTable(tables, "hhea");
  const os2 = requireTable(tables, "OS/2");

  return {
    ascender: hhea.readInt16BE(4),
    capHeight: os2.readInt16BE(88),
    descender: hhea.readInt16BE(6),
    lineGap: hhea.readInt16BE(8),
    typoAscender: os2.readInt16BE(68),
    typoDescender: os2.readInt16BE(70),
    typoLineGap: os2.readInt16BE(72),
    unitsPerEm: requireTable(tables, "head").readUInt16BE(18),
    useTypoMetrics:
      Math.floor(os2.readUInt16BE(62) / USE_TYPO_METRICS) % 2,
    winAscent: os2.readUInt16BE(74),
    winDescent: os2.readUInt16BE(76),
    xHeight: os2.readInt16BE(86),
  };
};

const sha256 = (buffer: Buffer): string =>
  createHash("sha256").update(buffer).digest("hex");

const sameSet = (a: Set<number>, b: Set<number>): boolean =>
  a.size === b.size && [...a].every((value) => b.has(value));

const listCodePoints = (codePoints: Iterable<number>): string =>
  [...codePoints]
    .sort((a, b) => a - b)
    .map(
      (codePoint) =>
        `${formatCodePoint(codePoint)} ${String.fromCodePoint(codePoint)}`
    )
    .join(", ");

const kib = (bytes: number): string => (bytes / 1024).toFixed(1);

const subsetOne = async (
  file: string,
  wanted: Set<number>,
  drawn: Set<number>
): Promise<CoverageFile[string]> => {
  const sourceFile = join(SOURCE_DIR, file);
  const source = readFileSync(join(FONTS_DIR, sourceFile));
  const sourceTables = readTables(source);
  const sourceCodePoints = readCodePoints(sourceTables);

  const kept = keptCodePoints(wanted, sourceCodePoints);
  const output = await subsetFont(
    source,
    String.fromCodePoint(...kept),
    {
      keepFeatures: [...KEPT_FEATURES],
      preserveNameIds: LICENCE_NAME_IDS,
      targetFormat: "woff2",
    }
  );
  const tables = readTables(output);
  const codePoints = readCodePoints(tables);

  if (!sameSet(codePoints, kept)) {
    throw new Error(
      `${file} : la sortie ne couvre pas exactement ce qui a été demandé`
    );
  }

  const before = JSON.stringify(readVerticalMetrics(sourceTables));
  const after = JSON.stringify(readVerticalMetrics(tables));
  if (before !== after) {
    throw new Error(
      `${file} : les métriques verticales ont bougé\n${before}\n${after}`
    );
  }

  const features = readFeatures(tables);
  const sourceFeatures = readFeatures(sourceTables);
  const lost = CSS_FEATURES.filter(
    (tag) => sourceFeatures.includes(tag) && !features.includes(tag)
  );
  if (lost.length > 0) {
    throw new Error(`${file} : fonction perdue (${lost.join(", ")})`);
  }

  writeFileSync(join(FONTS_DIR, file), output);

  const missing = [...drawn].filter(
    (codePoint) => !canDraw(sourceCodePoints, codePoint)
  );
  const dropped = sourceFeatures.filter(
    (tag) => !features.includes(tag)
  );

  console.log(
    [
      `${file} : ${source.byteLength} -> ${output.byteLength} octets (${kib(source.byteLength)} -> ${kib(output.byteLength)} Kio)`,
      `  points de code : ${sourceCodePoints.size} -> ${codePoints.size}`,
      `  axes : ${readAxes(tables).join(", ") || "aucun"}`,
      `  fonctions gardées : ${features.join(" ") || "aucune"}`,
      `  fonctions retirées : ${dropped.join(" ") || "aucune"}`,
      `  messages et contenus sans glyphe dans la source : ${listCodePoints(missing) || "aucun"}`,
    ].join("\n")
  );

  return {
    bytes: output.byteLength,
    codePoints: toRanges(codePoints),
    sha256: sha256(output),
    source: {
      bytes: source.byteLength,
      codePoints: toRanges(sourceCodePoints),
      file: sourceFile,
      sha256: sha256(source),
    },
  };
};

const main = async () => {
  const inventory = readInventory();
  const wanted = wantedCodePoints(inventory);
  const drawn = new Set([
    ...inventory.messages,
    ...inventory.content,
  ]);
  const coverage: CoverageFile = {};

  console.log(
    `inventaire : ${inventory.messages.size} points de code dans les messages, ${inventory.content.size} dans les contenus, ${inventory.code.size} dans le code ; ${wanted.size} demandés`
  );

  for (const file of [...FILES].sort()) {
    coverage[file] = await subsetOne(file, wanted, drawn);
  }

  writeFileSync(
    COVERAGE_FILE,
    `${JSON.stringify(coverage, null, 2)}\n`
  );
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
