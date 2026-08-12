import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { compile } from "@inlang/paraglide-js";

// Compile les messages inlang vers src/paraglide/ (runtime généré, non commité).
// Utilise l'API programmatique : la CLI ne permet pas de passer urlPatterns,
// nécessaires pour la stratégie URL « fr à la racine, /en préfixé ».

const OUTDIR = "./src/paraglide";
const MESSAGES_DIR = "./messages";
const BASE_LOCALE = "fr";

await compile({
  outdir: OUTDIR,
  project: "./project.inlang",
  strategy: ["url", "cookie", "baseLocale"],
  urlPatterns: [
    {
      localized: [
        ["en", "/en/:path(.*)?"],
        ["fr", "/:path(.*)?"],
      ],
      pattern: "/:path(.*)?",
    },
  ],
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
