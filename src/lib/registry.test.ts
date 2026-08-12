import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Le registre distribué doit refléter le code du dépôt.
 *
 * `public/r/*.json` est ce que `npx shadcn add` télécharge. Les quatre payloads
 * avaient dérivé de leur source : `theme-switcher.json` distribuait encore
 * `SunIcon` alors que le composant importe `Sun`, et les trois autres portaient
 * un formatage antérieur à oxfmt.
 *
 * Rien ne pouvait le voir. Le site lui-même n'utilise JAMAIS ces fichiers : les
 * blocs de code des pages /components sont lus sur le disque par
 * `rehype-component`. Le registre n'est donc faux que pour les gens qui
 * l'installent — les seuls à ne pas pouvoir le signaler.
 *
 * Le test compare les contenus plutôt que de relancer la CLI shadcn : il tourne
 * en une milliseconde et n'a besoin d'aucun réseau.
 */

const REGISTRY_DIR = "public/r";

interface RegistryFile {
  path?: string;
  content?: string;
}

const payloads = readdirSync(REGISTRY_DIR)
  .filter(
    (name) => name.endsWith(".json") && name !== "registry.json"
  )
  .map((name) => ({
    files:
      (
        JSON.parse(
          readFileSync(join(REGISTRY_DIR, name), "utf-8")
        ) as { files?: RegistryFile[] }
      ).files ?? [],
    name,
  }));

describe("registre distribué", () => {
  it("expose au moins un payload par composant", () => {
    // garde-fou sur la garde : un dossier vide passerait au vert
    expect(payloads.length).toBeGreaterThanOrEqual(4);
  });

  for (const { files, name } of payloads) {
    it(`${name} reflète le code du dépôt`, () => {
      expect(files.length).toBeGreaterThan(0);

      for (const file of files) {
        if (!file.path) {
          continue;
        }

        // un payload qui référence un fichier disparu est aussi cassé qu'un
        // payload périmé, et se lit exactement pareil pour qui l'installe
        expect(
          existsSync(file.path),
          `${name} référence ${file.path}, absent du dépôt`
        ).toBe(true);

        expect(
          file.content,
          `${name} → ${file.path} a dérivé de sa source : lancer \`pnpm registry:build\``
        ).toBe(readFileSync(file.path, "utf-8"));
      }
    });
  }
});
