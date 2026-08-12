import type {
  BlogPosting as PageSchema,
  WithContext,
} from "schema-dts";

import GLOBAL_DATA from "@/data/global";
import type { AppLocale } from "@/lib/i18n";

import type { Content } from "./content";
import { dayjs } from "./functions";
import { BASE_URL, openGraphImage } from "./metadata";

const CATEGORY_OG_TYPES: Record<string, PageType> = {
  articles: "blogArticle",
  components: "componentsArticle",
  utils: "utilsArticle",
};

export const getPageJsonLd = (
  { metadata, slug }: Content,
  /** locale de la PAGE, pas du fichier servi : /en peut afficher du contenu FR */
  locale: AppLocale = "fr"
): WithContext<PageSchema> => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  author: {
    "@type": "Person",
    identifier: GLOBAL_DATA.USER.username,
    image: GLOBAL_DATA.USER.avatar,
    name: GLOBAL_DATA.USER.firstName,
  },
  dateModified: dayjs(metadata.updatedAt).toISOString(),
  datePublished: dayjs(metadata.createdAt).toISOString(),
  description: metadata.description,
  headline: metadata.title,
  image: metadata.image
    ? `${BASE_URL}${metadata.image}`
    : openGraphImage({
        description: metadata.description,
        locale,
        title: metadata.title,
        type: CATEGORY_OG_TYPES[metadata.category ?? "articles"],
      }),
  inLanguage: locale === "en" ? "en-US" : "fr-FR",
  url: `${BASE_URL}${locale === "en" ? "/en" : ""}/${metadata.category}/${slug}`,
});
