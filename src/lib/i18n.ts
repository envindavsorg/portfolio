import { cache } from "react";

import {
  assertIsLocale,
  baseLocale,
  getLocale,
  overwriteGetLocale,
} from "@/paraglide/runtime";

export type AppLocale = "fr" | "en";

/**
 * Une fonction de message Paraglide, telle qu'elle est réellement générée.
 *
 * Les données co-localisées (`PROJECTS`, `EXPERIENCES`) stockent des messages et
 * non des chaînes : c'est ce qui permet à la page d'accueil de les rendre dans la
 * locale courante. Mais un thunk typé `() => string` a deux défauts.
 *
 * Le premier est qu'il cache le second paramètre : un appelant qui n'est PAS un
 * composant — le miroir texte de `(llms)/`, évalué au build, hors de tout layout —
 * n'a alors aucun moyen de demander une locale explicite.
 *
 * Le second est plus grave : `${message}` compile sans le moindre bruit et
 * interpole le CODE SOURCE de la fonction. C'est exactement ce que /projects.md et
 * /experience.md servaient aux crawlers, à la place des libellés. Nommer le type
 * ne suffit pas à l'empêcher, mais rend l'intention lisible à la relecture.
 */
export type Message = (
  inputs?: Record<string, never>,
  options?: { locale?: AppLocale }
) => string;

const INTL_LOCALES: Record<AppLocale, string> = {
  en: "en-US",
  fr: "fr-FR",
};

/**
 * Étiquette BCP 47 pour les API `Intl` / `toLocaleString`, dérivée du locale
 * Paraglide courant. Évite de répéter le ternaire `=== "en" ? "en-US" : "fr-FR"`
 * dans chaque composant qui formate une date ou un nombre.
 */
export const getIntlLocale = (): string =>
  INTL_LOCALES[getLocale() as AppLocale] ?? INTL_LOCALES.fr;

// Workaround officiel Paraglide pour Next.js : pas d'AsyncLocalStorage en RSC,
// le locale de la requête est scopé via React cache() et posé par le layout
// racine de chaque arbre de routes ((fr)/ ou en/).
const ssrLocale = cache(() => ({ locale: baseLocale as string }));

if (typeof window === "undefined") {
  overwriteGetLocale(() => assertIsLocale(ssrLocale().locale));
}

export const setServerLocale = (locale: AppLocale) => {
  ssrLocale().locale = assertIsLocale(locale);
};
