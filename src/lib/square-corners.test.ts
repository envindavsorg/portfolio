import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Le site est tracé à l'équerre : plus rien n'est rond.
 *
 * L'échelle des rayons est à zéro dans le bloc `@theme` de `globals.css`, donc
 * `rounded-md` et ses voisins ne dessinent plus rien d'arrondi. Deux écritures
 * passent à côté de cette échelle : `rounded-full`, qui ne lit aucune variable
 * du thème, et un rayon arbitraire (`rounded-[12px]`). Elles ont été retirées
 * à la main ; ce test refuse leur retour, parce qu'une seule pilule oubliée au
 * milieu de boîtes carrées se voit tout de suite, mais seulement une fois en
 * ligne.
 *
 * Un seul endroit garde son dessin : les composants de `src/registry/`,
 * distribués et installés ailleurs. Les cartes sociales de `/api/og` et le
 * mail du CV sont dessinés en styles en ligne, hors de portée des classes :
 * ils sont à l'équerre eux aussi, et un `borderRadius` en ligne est refusé au
 * même titre qu'une classe ronde.
 */
const SRC = "src";

const ROUND = /\brounded-(?:full|\[[^\]]+\])/gu;

const INLINE_RADIUS = /\bborderRadius\b/gu;

const exempt = (path: string) =>
  path.startsWith("registry/") ||
  path.startsWith("__registry__/") ||
  path.startsWith("paraglide/");

const SOURCES = readdirSync(SRC, {
  recursive: true,
  withFileTypes: true,
})
  .filter(
    (entry) =>
      entry.isFile() &&
      /\.tsx?$/u.test(entry.name) &&
      !/\.test\.tsx?$/u.test(entry.name)
  )
  .map((entry) => relative(SRC, join(entry.parentPath, entry.name)))
  .filter((path) => !exempt(path));

const occurrences = (pattern: RegExp): string[] =>
  SOURCES.flatMap((path) => {
    const text = readFileSync(join(SRC, path), "utf-8");
    return [...text.matchAll(pattern)].map(
      (match) =>
        `${path}:${text.slice(0, match.index).split("\n").length} — ${match[0]}`
    );
  });

describe("coins du site", () => {
  it("aucune classe ronde hors du registre", () => {
    expect(occurrences(ROUND)).toEqual([]);
  });

  it("aucun rayon en ligne hors du registre", () => {
    expect(occurrences(INLINE_RADIUS)).toEqual([]);
  });

  it("l'échelle des rayons est à zéro dans le thème", () => {
    const css = readFileSync(join(SRC, "app/globals.css"), "utf-8");

    for (const step of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]) {
      expect(css).toContain(`--radius-${step}: 0px;`);
    }
  });

  // TÉMOIN : la recherche trouve bien ce qu'elle cherche, là où c'est permis
  it("le registre, lui, garde ses formes", () => {
    const switcher = readFileSync(
      join(SRC, "registry/theme-switcher/ThemeSwitcher.tsx"),
      "utf-8"
    );

    expect(switcher.match(ROUND)?.length).toBeGreaterThan(0);
    expect(SOURCES.length).toBeGreaterThan(100);
  });
});
