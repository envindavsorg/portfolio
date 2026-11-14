import type { AppLocale } from "@/lib/i18n";

const RSS_FEED_PATHS: Record<AppLocale, string> = {
  en: "/api/rss/en",
  fr: "/api/rss",
};

/**
 * Le flux RSS « tous les contenus » de la langue affichée.
 *
 * Deux liens de l'interface y mènent — l'icône de la barre et le pied de page.
 * La règle tenait dans la barre seule : le pied ouvrait donc toujours le flux
 * français, y compris sous /en. Un module sans dépendance, parce que la barre
 * est un composant client : `feed.ts` aurait mis les tags dans chaque page.
 */
export const rssFeedPath = (locale: AppLocale): string =>
  RSS_FEED_PATHS[locale];
