"use client";

import type { ReactNode } from "react";

import {
  assertIsLocale,
  overwriteGetLocale,
} from "@/paraglide/runtime";

interface LocaleProviderProps {
  children: ReactNode;
  locale: string;
}

// Le pass SSR des client components ne partage pas le React cache() des RSC :
// sans cet overwrite, getLocale() retomberait sur baseLocale ("fr") pendant le
// prerender des pages /en. La locale vient du layout racine de l'arbre courant,
// elle est donc toujours correcte — y compris après hydratation.
//
// C'est le SEUL `overwriteGetLocale` permis dans le graphe client. Un second,
// posé à la portée d'un module, s'exécute quand son chunk est chargé — au beau
// milieu du rendu — et remplace celui-ci pour tout ce qui suit (voir
// `i18n-server.ts`). `i18n-server.test.ts` compte les appelants.
export const LocaleProvider = ({
  children,
  locale,
}: LocaleProviderProps) => {
  overwriteGetLocale(() => assertIsLocale(locale));
  return children;
};
