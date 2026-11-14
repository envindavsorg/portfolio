import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  baseLocale,
  deLocalizeHref,
  extractLocaleFromUrl,
  locales,
  localizeHref,
} from "@/paraglide/runtime";

/**
 * Le contrat d'URL du site : français à la racine, anglais sous `/en`.
 *
 * `compile-i18n.mts` ne déclare plus de `urlPatterns` : le routage par défaut
 * de Paraglide donne ces mêmes URL sans embarquer `urlpattern-polyfill` dans
 * chaque page. Mais « par défaut » veut dire que le comportement appartient à
 * une dépendance — une montée de version peut le déplacer sans qu'aucun fichier
 * du dépôt ne change. Ces attentes sont écrites à la main, depuis le contrat et
 * non depuis le runtime : elles échouent si l'un des deux bouge.
 *
 * Les valeurs ont été comparées une fois à l'ancien runtime (91 sondes, dans
 * deux processus séparés) : zéro écart.
 */

const ORIGIN = "https://cuzeacflorin.fr";

const CASES: {
  href: string;
  en: string;
  fr: string;
  locale: "en" | "fr";
}[] = [
  { en: "/en/", fr: "/", href: "/", locale: "fr" },
  { en: "/en", fr: "/", href: "/en", locale: "en" },
  {
    en: "/en/articles",
    fr: "/articles",
    href: "/en/articles",
    locale: "en",
  },
  {
    en: "/en/articles/x",
    fr: "/articles/x",
    href: "/articles/x",
    locale: "fr",
  },
  // le piège : un chemin qui COMMENCE par « en » sans être le segment `/en`
  {
    en: "/en/english-not-a-locale",
    fr: "/english-not-a-locale",
    href: "/english-not-a-locale",
    locale: "fr",
  },
  // la requête et le fragment traversent intacts : /search vit du fragment
  {
    en: "/en/search#q=css",
    fr: "/search#q=css",
    href: "/en/search#q=css",
    locale: "en",
  },
  {
    en: "/en/tags/css?x=1#frag",
    fr: "/tags/css?x=1#frag",
    href: "/tags/css?x=1#frag",
    locale: "fr",
  },
];

describe("routage des locales", () => {
  it("garde le français comme locale de base", () => {
    expect(baseLocale).toBe("fr");
    expect([...locales]).toEqual(["fr", "en"]);
  });

  for (const { en, fr, href, locale } of CASES) {
    describe(href, () => {
      it(`passe en anglais sous ${en}`, () => {
        expect(localizeHref(href, { locale: "en" })).toBe(en);
      });

      it(`revient au français sur ${fr}`, () => {
        expect(localizeHref(href, { locale: "fr" })).toBe(fr);
        expect(deLocalizeHref(href)).toBe(fr);
      });

      it(`est lu comme « ${locale} »`, () => {
        expect(extractLocaleFromUrl(`${ORIGIN}${href}`)).toBe(locale);
      });
    });
  }

  it("ne fait plus importer le polyfill URLPattern au runtime généré", () => {
    // lu dans le FICHIER et non sur `globalThis` : Node 24 expose URLPattern
    // nativement, le global ne prouverait donc rien. C'est cet import qui
    // mettait 18 Ko dans chaque page.
    const runtime = readFileSync("src/paraglide/runtime.js", "utf-8");

    expect(runtime).not.toContain("urlpattern-polyfill");
  });
});
