import { compile } from "@inlang/paraglide-js";

// Compile les messages inlang vers src/paraglide/ (runtime généré, non commité).
// Utilise l'API programmatique : la CLI ne permet pas de passer urlPatterns,
// nécessaires pour la stratégie URL « fr à la racine, /en préfixé ».
await compile({
  outdir: "./src/paraglide",
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
