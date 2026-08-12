import type { Metadata } from "next";

import GLOBAL_DATA from "@/data/global";
import type { Content, ContentCategory } from "@/lib/content";
import type { AppLocale } from "@/lib/i18n";

interface OpenGraphImageParams {
  description?: string;
  title: string;
  type?: string;
  /** locale du badge de la carte ; le défaut reste le français */
  locale?: AppLocale;
}

interface ArticleParams {
  /** date de publication, en ISO 8601 */
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[];
}

interface MetadataConfig {
  description: string;
  locale?: AppLocale;
  ogImageParams?: OpenGraphImageParams;
  /** chemin SANS préfixe de locale, ex. "/articles" */
  path?: string;
  title: string;
  /** présent = la page est un article : `og:type` bascule et les dates sortent */
  article?: ArticleParams;
}

export const BASE_URL = "https://cuzeacflorin.fr";

const FEED_LABELS: Record<
  AppLocale,
  { all: string; articles: string; components: string; utils: string }
> = {
  en: {
    all: "all content",
    articles: "articles",
    components: "components",
    utils: "tools",
  },
  fr: {
    all: "tous les contenus",
    articles: "articles",
    components: "composants",
    utils: "outils",
  },
};

/**
 * Autodécouverte des flux, à réémettre sur CHAQUE page.
 *
 * Next.js ne fusionne pas les objets imbriqués de `metadata` : dès qu'une page
 * déclare son propre `alternates`, celui du layout racine est remplacé en entier,
 * pas complété. Les `<link rel="alternate">` des flux ne sortaient donc sur
 * AUCUNE page du site — vérifié sur le build : zéro occurrence de
 * `application/rss` dans les documents servis, alors que les quatre flux
 * existent et fonctionnent.
 */
const feedAlternates = (
  locale: AppLocale
): NonNullable<Metadata["alternates"]>["types"] => {
  const name = GLOBAL_DATA.USER.fullName;
  const labels = FEED_LABELS[locale];

  return {
    "application/feed+json": [
      {
        title: `${name} — JSON Feed`,
        url: `${BASE_URL}/api/feed.json`,
      },
    ],
    "application/rss+xml": [
      {
        title: `${name} — ${labels.all}`,
        url: `${BASE_URL}/api/rss`,
      },
      {
        title: `${name} — ${labels.articles}`,
        url: `${BASE_URL}/api/rss/articles`,
      },
      {
        title: `${name} — ${labels.components}`,
        url: `${BASE_URL}/api/rss/components`,
      },
      {
        title: `${name} — ${labels.utils}`,
        url: `${BASE_URL}/api/rss/utils`,
      },
    ],
  };
};

const localizePath = (path: string, locale: AppLocale): string => {
  if (locale === "fr") {
    return path;
  }
  return path === "/" ? "/en" : `/en${path}`;
};

const absoluteUrl = (path: string, locale: AppLocale): string => {
  const localized = localizePath(path, locale);
  return localized === "/" ? BASE_URL : `${BASE_URL}${localized}`;
};

export const openGraphImage = ({
  description,
  locale,
  title,
  type = "homepage",
}: OpenGraphImageParams): string => {
  const params = new URLSearchParams({ title: title.trim(), type });
  if (description?.trim()) {
    params.set("description", description.trim());
  }
  // les cartes des pages /en portaient un badge en français
  if (locale === "en") {
    params.set("locale", "en");
  }
  return `${BASE_URL}/api/og?${params}`;
};

export const createMetadata = ({
  article,
  description,
  locale = "fr",
  ogImageParams,
  path,
  title,
}: MetadataConfig): Metadata => {
  const url = path ? absoluteUrl(path, locale) : undefined;
  const imageUrl = ogImageParams
    ? openGraphImage({ locale, ...ogImageParams })
    : undefined;

  // le tronc commun aux deux formes d'`og:type` : le construire une fois évite
  // que la variante « article » dérive de la variante « website »
  const openGraphBase = {
    description,
    ...(imageUrl && {
      images: [
        { alt: title, height: 630, url: imageUrl, width: 1200 },
      ],
    }),
    locale: locale === "fr" ? "fr_FR" : "en_US",
    siteName: GLOBAL_DATA.USER.fullName,
    title,
    ...(url && { url }),
  };

  return {
    alternates: {
      // `types` n'est PAS conditionné par `path` : une page sans canonical a
      // quand même besoin d'annoncer les flux
      types: feedAlternates(locale),
      ...(path && {
        canonical: url,
        languages: {
          en: absoluteUrl(path, "en"),
          fr: absoluteUrl(path, "fr"),
          "x-default": absoluteUrl(path, "fr"),
        },
      }),
    },
    description,
    openGraph: article
      ? {
          ...openGraphBase,
          authors: [GLOBAL_DATA.USER.fullName],
          modifiedTime: article.modifiedTime ?? article.publishedTime,
          publishedTime: article.publishedTime,
          ...(article.tags?.length && { tags: article.tags }),
          type: "article",
        }
      : { ...openGraphBase, type: "website" },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      ...(imageUrl && { images: [imageUrl] }),
      title,
    },
  };
};

const OG_TYPE_BY_CATEGORY: Record<ContentCategory, string> = {
  articles: "blogArticle",
  components: "componentsArticle",
  utils: "utilsArticle",
};

/**
 * Métadonnées d'une page de contenu, pour les DEUX arbres de routes.
 *
 * Les six pages de détail (trois catégories × deux locales) construisaient le
 * même objet à la main. C'est précisément la forme de duplication qui produit la
 * dérive FR/EN documentée dans ce dépôt : les dates `og:article` ajoutées ici
 * n'auraient été posées que sur l'arbre qu'on aurait pensé à modifier.
 */
export const createContentMetadata = (
  content: Content,
  locale: AppLocale = "fr"
): Metadata => {
  const { category, createdAt, description, tags, title, updatedAt } =
    content.metadata;

  return createMetadata({
    article: {
      modifiedTime: updatedAt.toISOString(),
      publishedTime: createdAt.toISOString(),
      tags,
    },
    description,
    locale,
    ogImageParams: {
      description,
      title,
      type: category ? OG_TYPE_BY_CATEGORY[category] : undefined,
    },
    ...(category && { path: `/${category}/${content.slug}` }),
    title,
  });
};

const TITLE_TEMPLATES: Record<AppLocale, string> = {
  en: "%s - Full-Stack Developer – Personal portfolio",
  fr: "%s - Développeur Full-Stack – Portfolio personnel",
};

// metadata du layout racine de chaque arbre de routes ((fr)/ et en/)
export const createRootMetadata = (locale: AppLocale): Metadata => ({
  // autodécouverte des flux : sans ces <link rel="alternate">, un lecteur RSS
  // ne trouve pas le flux depuis l'URL du site. Même constructeur que
  // `createMetadata`, qui doit les réémettre page par page (voir feedAlternates)
  alternates: {
    types: feedAlternates(locale),
  },
  authors: [
    {
      name: "envindavsorg",
      url: BASE_URL,
    },
  ],
  creator: "envindavsorg",
  description: GLOBAL_DATA.USER.description,
  icons: {
    apple: {
      sizes: "180x180",
      type: "image/png",
      url: "/apple-touch-icon.png",
    },
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicons/favicon-light.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicons/favicon-dark.ico",
      },
    ],
  },
  keywords: GLOBAL_DATA.keywords,
  metadataBase: BASE_URL,
  openGraph: {
    firstName: GLOBAL_DATA.USER.firstName,
    gender: GLOBAL_DATA.USER.gender,
    images: [
      {
        alt: GLOBAL_DATA.USER.fullName,
        height: 630,
        url: GLOBAL_DATA.USER.og,
        width: 1200,
      },
    ],
    lastName: GLOBAL_DATA.USER.lastName,
    locale: locale === "fr" ? "fr_FR" : "en_US",
    siteName: GLOBAL_DATA.USER.fullName,
    type: "profile",
    url: locale === "fr" ? "/" : "/en",
    username: GLOBAL_DATA.USER.username,
  },
  title: {
    default: GLOBAL_DATA.USER.fullName,
    template: TITLE_TEMPLATES[locale],
  },
});
