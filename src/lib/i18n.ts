import { cache } from "react";

import {
  assertIsLocale,
  baseLocale,
  getLocale,
  overwriteGetLocale,
} from "@/paraglide/runtime";

export type AppLocale = "fr" | "en";

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
