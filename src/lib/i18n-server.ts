import "server-only";

import { cache } from "react";

import type { AppLocale } from "@/lib/i18n";
import {
  assertIsLocale,
  baseLocale,
  overwriteGetLocale,
} from "@/paraglide/runtime";

/**
 * La locale de la requête, côté Server Components.
 *
 * Workaround officiel Paraglide pour Next.js : pas d'AsyncLocalStorage en RSC,
 * la locale est scopée à la requête par le `cache()` de React et posée par le
 * layout racine de chaque arbre de routes, à travers `RootDocument`.
 *
 * `server-only` n'est pas décoratif. Ce code vivait dans `i18n.ts`, que des
 * composants client importent pour `getIntlLocale`. Next compile alors une
 * SECONDE copie du module pour le rendu serveur des composants client, avec
 * son propre runtime Paraglide — et hors RSC le `cache()` de React ne
 * mémorise rien : ce getter n'y répond jamais que `baseLocale`.
 *
 * Or cette copie n'est évaluée qu'au premier `require` du chunk qui la
 * contient, donc EN PLEIN RENDU. Son `overwriteGetLocale` remplaçait celui
 * que `LocaleProvider` venait de poser, et tout composant client rendu
 * ensuite sortait en français : sur /en, les boutons du CV, « à propos » et la
 * légende du graphe, puis une erreur React #418 à l'hydratation.
 */
const requestLocale = cache(() => ({ locale: baseLocale as string }));

overwriteGetLocale(() => assertIsLocale(requestLocale().locale));

export const setServerLocale = (locale: AppLocale) => {
  requestLocale().locale = assertIsLocale(locale);
};
