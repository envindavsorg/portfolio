import type {
  BlogPosting as PageSchema,
  WithContext,
} from "schema-dts";

import GLOBAL_DATA from "@/data/global";

import type { Content } from "./content";
import { dayjs } from "./functions";
import { BASE_URL, openGraphImage } from "./metadata";

const CATEGORY_OG_TYPES: Record<string, PageType> = {
  articles: "blogArticle",
  components: "componentsArticle",
  utils: "utilsArticle",
};

export const getPageJsonLd = ({
  metadata,
  slug,
}: Content): WithContext<PageSchema> => ({
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
        title: metadata.title,
        type: CATEGORY_OG_TYPES[metadata.category ?? "articles"],
      }),
  url: `${BASE_URL}/${metadata.category}/${slug}`,
});
