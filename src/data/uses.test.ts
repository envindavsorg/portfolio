import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { USES, usesGroups } from "@/data/uses";

/**
 * Ce que /uses annonce doit rester vrai.
 *
 * Une page « ce que j'utilise » se périme en silence : personne ne relit ses
 * listes, et une version qui bouge dans un fichier de configuration ne fait pas
 * bouger la page. Le groupe « environnement » est justement celui qui reprend des
 * réglages versionnés — ces tests le confrontent aux FICHIERS, pas à une seconde
 * copie des mêmes valeurs.
 *
 * C'est le même contrat que `weights.ts` : un chiffre publié et sa source définis
 * séparément finiraient par se contredire.
 */

const item = (groupId: string, name: string): boolean =>
  USES.find((group) => group.id === groupId)?.items.some(
    (entry) => entry.name === name
  ) === true;

describe("groupe environnement", () => {
  it("annonce la version de Node du dépôt", () => {
    const declared = readFileSync(".node-version", "utf-8").trim();

    expect(
      item("environment", `Node.js ${declared}`),
      `.node-version dit ${declared}`
    ).toBe(true);
  });

  /**
   * Chaque entrée de ce groupe repose sur un fichier suivi par git. `/.zed` est
   * dans le `.gitignore`, mais l'ignorance ne s'applique pas à un fichier déjà
   * suivi : `.zed/settings.json` est bien versionné, et c'est lui qui autorise à
   * nommer l'éditeur.
   */
  it("repose sur des fichiers réellement présents", () => {
    for (const path of [
      ".zed/settings.json",
      ".node-version",
      ".editorconfig",
      ".claude/settings.json",
    ]) {
      expect(existsSync(path), `${path} introuvable`).toBe(true);
    }
  });
});

describe("USES", () => {
  it("ne nomme jamais deux fois la même chose", () => {
    const names = USES.flatMap((group) =>
      group.items.map((entry) => entry.name)
    );

    expect(new Set(names).size).toBe(names.length);
  });

  it("ne donne que des liens https absolus", () => {
    const bad = USES.flatMap((group) => group.items)
      .map((entry) => entry.link)
      .filter((link) => link !== undefined)
      .filter((link) => !link.startsWith("https://"));

    expect(bad).toEqual([]);
  });

  it("écarte les groupes vides du rendu", () => {
    const visible = usesGroups([
      ...USES,
      {
        id: "vide",
        items: [],
        note: USES[0].note,
        title: USES[0].title,
      },
    ]);

    expect(visible.map((group) => group.id)).not.toContain("vide");
    expect(visible).toHaveLength(USES.length);
  });
});
