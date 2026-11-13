import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { compile } from "@inlang/paraglide-js";

// Compile les messages inlang vers src/paraglide/ (runtime généré, non commité).
// L'API programmatique reste nécessaire pour le garde-fou en bas de fichier
// (compter les messages et faire échouer le build), plus pour le routage.

const OUTDIR = "./src/paraglide";
const MESSAGES_DIR = "./messages";
const BASE_LOCALE = "fr";

/**
 * PAS de `urlPatterns` : le routage par défaut de Paraglide EST « locale de base
 * à la racine, les autres sous leur préfixe », donc `fr` à `/` et `en` sous
 * `/en`. Le déclarer à la main donnait exactement les mêmes URL, mais faisait
 * importer `urlpattern-polyfill` par le runtime généré : 18 Ko (6 Kio gzip)
 * servis sur chaque page, pour réécrire un comportement déjà fourni.
 *
 * `src/lib/i18n-routing.test.ts` fige ce contrat, y compris le cas qui trahit
 * un préfixe comparé trop vite : `/english` n'est pas de l'anglais.
 *
 * Une route qui sortirait de ce schéma — domaine par langue, segment traduit —
 * redemanderait `urlPatterns`, et le polyfill reviendrait avec. Ne pas passer
 * par `lazyUrlPatternPolyfill` : il met un `await` de premier niveau dans
 * `runtime.js`.
 */
await compile({
  outdir: OUTDIR,
  project: "./project.inlang",
  strategy: ["url", "cookie", "baseLocale"],
});

/**
 * `compile()` ne rejette PAS quand un plugin inlang est injoignable : il émet
 * un warning et produit un bundle VIDE. Le site se construit alors sans une
 * seule chaîne de caractères, et l'erreur ne se voit qu'en production.
 *
 * On compare donc le nombre de messages générés à la locale de référence et on
 * fait échouer le build en cas d'écart.
 */
const countSourceMessages = async (): Promise<number> => {
  const raw = await readFile(
    join(MESSAGES_DIR, `${BASE_LOCALE}.json`),
    "utf-8"
  );
  const parsed: Record<string, unknown> = JSON.parse(raw);
  return Object.keys(parsed).filter((key) => !key.startsWith("$"))
    .length;
};

const countCompiledMessages = async (): Promise<number> => {
  const files = await readdir(join(OUTDIR, "messages"));
  return files.filter(
    (file) => file.endsWith(".js") && file !== "_index.js"
  ).length;
};

const [expected, compiled] = await Promise.all([
  countSourceMessages(),
  countCompiledMessages(),
]);

if (compiled < expected) {
  console.error(
    `\n❌ i18n: ${compiled} message(s) compilé(s) pour ${expected} attendu(s) dans messages/${BASE_LOCALE}.json.`
  );
  console.error(
    "   Cause la plus probable : un plugin inlang n'a pas pu être chargé (voir les warnings ci-dessus)."
  );
  console.error(
    "   Les plugins sont résolus depuis node_modules — vérifie que `pnpm i` a bien été exécuté.\n"
  );
  process.exit(1);
}

console.info(`✓ i18n: ${compiled} messages compilés.`);
