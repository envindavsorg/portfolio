import { cache } from "react";

import {
  assertIsLocale,
  baseLocale,
  overwriteGetLocale,
} from "@/paraglide/runtime";

export type AppLocale = "fr" | "en";

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
