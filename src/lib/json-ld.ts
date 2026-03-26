import type {
  BlogPosting as PageSchema,
  WithContext,
} from "schema-dts";

import GLOBAL_DATA from "@/data/global";

import type { Content } from "./content";
import { dayjs } from "./functions";

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
  image:
    metadata.image ||
    `/og/simple?title=${encodeURIComponent(metadata.title)}`,
  url: `https://cuzeacflorin.fr/${metadata.category}/${slug}`,
});
