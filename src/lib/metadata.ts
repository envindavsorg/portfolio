import type { Metadata } from "next";

import GLOBAL_DATA from "@/data/global";
import type { AppLocale } from "@/lib/i18n";

interface OpenGraphImageParams {
  description?: string;
  title: string;
  type?: string;
}

interface MetadataConfig {
  description: string;
  locale?: AppLocale;
  ogImageParams?: OpenGraphImageParams;
  /** chemin SANS préfixe de locale, ex. "/articles" */
  path?: string;
  title: string;
}

export const BASE_URL = "https://cuzeacflorin.fr";

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
  title,
  type = "homepage",
}: OpenGraphImageParams): string => {
  const params = new URLSearchParams({ title: title.trim(), type });
  if (description?.trim()) {
    params.set("description", description.trim());
  }
  return `${BASE_URL}/api/og?${params}`;
};

export const createMetadata = ({
  description,
  locale = "fr",
  ogImageParams,
  path,
  title,
}: MetadataConfig): Metadata => {
  const url = path ? absoluteUrl(path, locale) : undefined;
  const imageUrl = ogImageParams
    ? openGraphImage(ogImageParams)
    : undefined;

  return {
    ...(path && {
      alternates: {
        canonical: url,
        languages: {
          en: absoluteUrl(path, "en"),
          fr: absoluteUrl(path, "fr"),
          "x-default": absoluteUrl(path, "fr"),
        },
      },
    }),
    description,
    openGraph: {
      description,
      ...(imageUrl && {
        images: [
          { alt: title, height: 630, url: imageUrl, width: 1200 },
        ],
      }),
      locale: locale === "fr" ? "fr_FR" : "en_US",
      title,
      type: "website",
      ...(url && { url }),
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      ...(imageUrl && { images: [imageUrl] }),
      title,
    },
  };
};

const TITLE_TEMPLATES: Record<AppLocale, string> = {
  en: "%s - Full-Stack Developer – Personal portfolio",
  fr: "%s - Développeur Full-Stack – Portfolio personnel",
};

// metadata du layout racine de chaque arbre de routes ((fr)/ et en/)
export const createRootMetadata = (locale: AppLocale): Metadata => ({
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
