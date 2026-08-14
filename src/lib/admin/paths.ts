/**
 * Où vit un contenu dans le dépôt, et comment y revenir.
 *
 * Module PUR. Il n'écrit rien : il calcule un chemin. Mais c'est ce chemin qui
 * part ensuite dans un commit GitHub, et il est composé à partir d'un slug et
 * d'une catégorie qui viennent d'une URL — donc de l'extérieur.
 *
 * ⚠️ LE RISQUE EST LA TRAVERSÉE DE CHEMIN.
 *
 * Un slug `../../../.github/workflows/ci` transformerait « enregistrer un
 * article » en « réécrire la CI ». L'espace est réservé au propriétaire, mais un
 * contrôle d'accès n'est pas une raison de composer des chemins naïvement : la
 * validation ci-dessous rejette tout ce qui n'est pas un segment simple, plutôt
 * que de tenter de nettoyer.
 */

import type { ContentLocale } from "@/lib/content";

export const CONTENT_ROOT = "src/content";

export const CONTENT_CATEGORIES = [
  "articles",
  "components",
  "utils",
] as const;

export type ContentCategoryName = (typeof CONTENT_CATEGORIES)[number];

/** un segment de chemin sûr : minuscules, chiffres, tirets */
const SAFE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export const isSafeSlug = (value: string): boolean =>
  SAFE_SEGMENT.test(value);

export const isContentCategory = (
  value: string
): value is ContentCategoryName =>
  (CONTENT_CATEGORIES as readonly string[]).includes(value);

export interface ContentLocation {
  category: ContentCategoryName;
  slug: string;
  locale: ContentLocale;
}

/**
 * Le chemin du fichier, ou `null` si quoi que ce soit sort du cadre.
 *
 * Rendre `null` plutôt que de lancer laisse l'appelant répondre 404 sans
 * distinguer « n'existe pas » de « refusé » — un attaquant n'apprend rien de la
 * différence.
 */
export const contentFilePath = (
  location: ContentLocation
): string | null => {
  if (!isContentCategory(location.category)) {
    return null;
  }
  if (!isSafeSlug(location.slug)) {
    return null;
  }
  if (location.locale !== "fr" && location.locale !== "en") {
    return null;
  }

  // le français vit à la racine de sa catégorie, l'anglais dans `en/` — c'est la
  // convention que `content.ts` lit déjà
  const parts =
    location.locale === "en"
      ? [CONTENT_ROOT, location.category, "en", location.slug]
      : [CONTENT_ROOT, location.category, location.slug];

  return `${parts.join("/")}.mdx`;
};

/** l'adresse publique du contenu, pour aller le relire après enregistrement */
export const contentPublicPath = (
  location: ContentLocation
): string | null => {
  if (!contentFilePath(location)) {
    return null;
  }

  const prefix = location.locale === "en" ? "/en" : "";

  return `${prefix}/${location.category}/${location.slug}`;
};

/** l'identifiant utilisé dans les URL de l'administration */
export const locationKey = (location: ContentLocation): string =>
  `${location.locale}/${location.category}/${location.slug}`;

/** l'inverse : lire une clé venue de l'URL, sans rien supposer */
export const parseLocationKey = (
  segments: string[]
): ContentLocation | null => {
  if (segments.length !== 3) {
    return null;
  }

  const [locale, category, slug] = segments;

  if (locale !== "fr" && locale !== "en") {
    return null;
  }
  if (!isContentCategory(category)) {
    return null;
  }
  if (!isSafeSlug(slug)) {
    return null;
  }

  return { category, locale, slug };
};
