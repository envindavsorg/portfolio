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
  /**
   * Identifiant de la série à laquelle ce contenu appartient.
   *
   * C'est une CLÉ, pas un libellé : elle doit être identique dans toutes les
   * locales, sinon les traductions se retrouvent dans deux séries distinctes et
   * les URL cessent de se correspondre. Le libellé affiché passe par `seriesName`.
   */
  series: z.string().optional(),
  /** libellé affiché de la série ; à défaut, `series` est utilisé tel quel */
  seriesName: z.string().optional(),
  /** rang de lecture dans la série, à partir de 1 */
  seriesOrder: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  title: z.string(),
  updatedAt: z.coerce.date(),
});

export type ContentMetadata = z.infer<typeof contentMetadataSchema>;
export type ContentCategory = NonNullable<
  ContentMetadata["category"]
>;
export type ContentLocale = "fr" | "en";

/**
 * Réduit une locale Paraglide au domaine des locales de contenu.
 *
 * Sans cela il est trop facile d'appeler `getContentByCategory(cat)` en oubliant
 * la locale : le défaut est « fr », et la page /en sert alors du contenu
 * français sans le moindre avertissement.
 */
export const toContentLocale = (locale: string): ContentLocale =>
  locale === "en" ? "en" : "fr";

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

const DATE_FIELD = /^\s*(createdAt|updatedAt):\s*(\S+)\s*$/gmu;
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/u;

/**
 * YAML accepte `2026-26-02` et le fait DÉBORDER silencieusement en
 * 2028-02-02 (mois 26). La date fausse se propage ensuite au tri, au sitemap
 * (`lastModified` dans le futur) et au flux RSS, sans aucune erreur.
 *
 * On valide donc la chaîne brute du frontmatter avant que gray-matter ne la
 * convertisse en `Date`.
 */
const assertValidDates = (raw: string, source: string) => {
  const [, frontmatter = ""] = raw.split("---");

  for (const [, field, value] of frontmatter.matchAll(DATE_FIELD)) {
    const match = ISO_DAY.exec(value);
    if (!match) {
      throw new Error(
        `${source}: ${field} « ${value} » n'est pas une date YYYY-MM-DD.`
      );
    }

    const [, year, month, day] = match;
    const parsed = new Date(`${year}-${month}-${day}T00:00:00Z`);
    const overflowed =
      parsed.getUTCFullYear() !== Number(year) ||
      parsed.getUTCMonth() + 1 !== Number(month) ||
      parsed.getUTCDate() !== Number(day);

    if (Number.isNaN(parsed.getTime()) || overflowed) {
      throw new Error(
        `${source}: ${field} « ${value} » n'existe pas dans le calendrier (jour et mois inversés ?).`
      );
    }
  }
};

const parseFrontmatter = (body: string, source: string) => {
  assertValidDates(body, source);
  const { data, content } = matter(body);
  return { content, metadata: contentMetadataSchema.parse(data) };
};

const getMDXFiles = (dir: string) =>
  readdirSync(dir).filter((file: string) => file.endsWith(".mdx"));

const readMDXFile = (path: string) => {
  const raw = readFileSync(path, "utf-8");
  return parseFrontmatter(raw, path);
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

const isMissingDirectory = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: string }).code === "ENOENT";

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
  } catch (error) {
    // un dossier <categorie>/en/ absent est normal : la locale retombe sur le FR
    if (isMissingDirectory(error)) {
      return [];
    }

    // tout le reste (frontmatter invalide, date impossible, fichier illisible)
    // faisait disparaître la catégorie entière sans un mot : on échoue au build
    throw new Error(
      `Contenu illisible dans « ${dir} » : ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
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
  const updated = dayjs(content.metadata.updatedAt)
    .locale(content.locale)
    .format("dddd DD MMMM YYYY");

  // la locale du contenu servi, pas celle du site : un contenu EN sans
  // traduction retombe sur le FR et doit garder sa mention française
  const footer =
    content.locale === "en"
      ? `Last updated on ${updated}`
      : `Dernière mise à jour le ${updated}`;

  return `# ${content.metadata.title}
${content.metadata.description}
${processed.value}
${footer}`;
};
