import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Qui a le droit de remplacer `getLocale`.
 *
 * Le runtime Paraglide existe en deux exemplaires côté serveur : un pour les
 * Server Components, un pour le rendu serveur des composants client. Chacun a
 * UN propriétaire — `i18n-server.ts` pour le premier, `LocaleProvider` pour le
 * second. Un troisième `overwriteGetLocale`, posé à la portée d'un module du
 * graphe client, s'exécute quand son chunk est chargé, c'est-à-dire en plein
 * rendu, et remplace la locale de la page pour tout ce qui est rendu ensuite.
 *
 * C'est ce qui servait du français sur /en. Le défaut dépend de l'ordre dans
 * lequel les chunks sont évalués : `e2e/i18n.spec.ts` le voit quand cet ordre
 * est le mauvais, ce test le voit dans tous les cas.
 *
 * Les modules sont lus comme du TEXTE : importer `i18n-server.ts` ici
 * évaluerait `server-only`, que seul le compilateur de Next sait résoudre.
 */
const SRC = "src";

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
  // généré par `pnpm i18n:compile` : c'est là que la fonction est DÉFINIE
  .filter((path) => !path.startsWith("paraglide"))
  .map((path) => ({
    path,
    text: readFileSync(join(SRC, path), "utf-8"),
  }));

const callers = (name: string): string[] =>
  SOURCES.filter(({ text }) =>
    new RegExp(`\\b${name}\\(`, "u").test(text)
  )
    .map(({ path }) => path)
    .toSorted();

describe("propriétaires de getLocale côté serveur", () => {
  it("un seul module par exemplaire du runtime le remplace", () => {
    expect(callers("overwriteGetLocale")).toEqual([
      "components/providers/modules/LocaleProvider.tsx",
      "lib/i18n-server.ts",
    ]);
  });

  it("celui des Server Components refuse d'entrer dans le graphe client", () => {
    const source = SOURCES.find(
      ({ path }) => path === "lib/i18n-server.ts"
    )?.text;

    // première instruction du module : rien ne s'exécute avant le garde-fou
    expect(
      source?.trimStart().startsWith('import "server-only";')
    ).toBe(true);
  });

  // TÉMOIN : un motif qui ne trouverait jamais rien rendrait le premier test
  // vert pour de mauvaises raisons. `getLocale` est appelé un peu partout.
  it("la recherche d'appelants trouve bien quelque chose", () => {
    expect(callers("getLocale").length).toBeGreaterThan(10);
  });
});
