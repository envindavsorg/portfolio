import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import { z } from "zod";

import { dayjs } from "@/lib/functions";
import { remarkComponent } from "@/lib/remark-component";

const contentMetadataSchema = z.object({
  author: z.string().optional(),
  bannerDark: z.string().optional(),
  bannerLight: z.string().optional(),
  category: z.enum(["articles", "utils", "components"]).optional(),
  cover: z.string().optional(),
  createdAt: z.coerce.date(),
  description: z.string(),
  image: z.string().optional(),
  isNew: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  title: z.string(),
  updatedAt: z.coerce.date(),
});

export type ContentMetadata = z.infer<typeof contentMetadataSchema>;
export type ContentCategory = NonNullable<
  ContentMetadata["category"]
>;
export type ContentLocale = "fr" | "en";

export interface Content {
  metadata: ContentMetadata;
  slug: string;
  content: string;
  /** locale réelle du fichier servi (un contenu EN manquant retombe sur le FR) */
  locale: ContentLocale;
  reading: {
    time: string;
    words: number;
  };
}

const parseFrontmatter = (body: string) => {
  const { data, content } = matter(body);
  return { content, metadata: contentMetadataSchema.parse(data) };
};

const getMDXFiles = (dir: string) =>
  readdirSync(dir).filter((file: string) => file.endsWith(".mdx"));

const readMDXFile = (path: string) => {
  const raw = readFileSync(path, "utf-8");
  return parseFrontmatter(raw);
};

const WORDS_PER_MINUTE = 150;
const readingTime = (content: string) => {
  const words = content.trim().split(/\s+/u).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return { time: `${minutes} minutes`, words };
};

const getMDXData = (dir: string, locale: ContentLocale) =>
  getMDXFiles(dir).map<Content>((file) => {
    const { metadata, content } = readMDXFile(join(dir, file));
    const { time, words } = readingTime(content);
    return {
      content,
      locale,
      metadata,
      reading: { time, words },
      slug: basename(file, ".mdx"),
    };
  });

const contentCache: Partial<Record<ContentLocale, Content[]>> = {};
const CONTENT_PATH = "src/content";
const CONTENT_CATEGORIES = [
  "articles",
  "utils",
  "components",
] as const;

const readCategory = (
  dir: string,
  category: ContentCategory,
  locale: ContentLocale
): Content[] => {
  try {
    return getMDXData(dir, locale).map((content) => ({
      ...content,
      metadata: { ...content.metadata, category },
    }));
  } catch {
    return [];
  }
};

export const getAllContent = (locale: ContentLocale = "fr") => {
  const cached = contentCache[locale];
  if (cached && process.env.NODE_ENV !== "development") {
    return cached;
  }

  const root = join(process.cwd(), CONTENT_PATH);

  const entries = CONTENT_CATEGORIES.flatMap((category) => {
    const frEntries = readCategory(
      join(root, category),
      category,
      "fr"
    );

    if (locale === "fr") {
      return frEntries;
    }

    // traductions dans <categorie>/en/, fallback FR pour les slugs manquants
    const enEntries = readCategory(
      join(root, category, "en"),
      category,
      "en"
    );
    const enSlugs = new Set(enEntries.map((entry) => entry.slug));

    return [
      ...enEntries,
      ...frEntries.filter((entry) => !enSlugs.has(entry.slug)),
    ];
  }).toSorted(
    (a, b) =>
      b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
  );

  contentCache[locale] = entries;
  return entries;
};

export const getContentBySlug = (
  slug: string,
  category?: ContentCategory,
  locale: ContentLocale = "fr"
) =>
  getAllContent(locale).find(
    (content) =>
      content.slug === slug &&
      (!category || content.metadata.category === category)
  );

export const getContentByCategory = (
  category: ContentCategory,
  locale: ContentLocale = "fr"
) =>
  getAllContent(locale).filter(
    (content) => content.metadata.category === category
  );

const processor = remark()
  .use(remarkMdx)
  .use(remarkComponent)
  .use(remarkGfm);
export const getLLMText = async (
  content: Content
): Promise<string> => {
  const processed = await processor.process({
    value: content.content,
  });
  return `# ${content.metadata.title}
${content.metadata.description}
${processed.value}
Dernière mise à jour le ${dayjs(content.metadata.updatedAt).format("dddd DD MMMM YYYY")}`;
};
