import type { Content, ContentCategory } from "@/lib/content";

export interface FeedItem {
  title: string;
  description: string;
  url: string;
  category: ContentCategory;
  published: Date;
  updated: Date;
  tags: string[];
}

export interface FeedMeta {
  title: string;
  description: string;
  siteUrl: string;
  /** URL canonique du flux lui-même (atom:link rel="self") */
  feedUrl: string;
  author: string;
  language: string;
}

/**
 * Échappe le texte destiné à un nœud XML.
 *
 * Les blocs CDATA ne suffisent pas : un contenu qui renferme la séquence `]]>`
 * clôt le bloc par accident et casse le flux entier.
 */
export const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

/** RSS 2.0 impose des dates RFC-822 en anglais, pas la locale du site */
export const toRfc822 = (value: Date | number | string): string =>
  new Date(value).toUTCString();

export const toFeedItems = (
  posts: Content[],
  siteUrl: string
): FeedItem[] =>
  posts.map((post) => {
    const category = post.metadata.category ?? "articles";

    return {
      category,
      description: post.metadata.description,
      published: new Date(post.metadata.createdAt),
      tags: post.metadata.tags ?? [],
      title: post.metadata.title,
      updated: new Date(post.metadata.updatedAt),
      url: `${siteUrl}/${category}/${post.slug}`,
    };
  });

const latestUpdate = (items: FeedItem[]): Date => {
  let latest = new Date(0);
  for (const item of items) {
    if (item.updated.getTime() > latest.getTime()) {
      latest = item.updated;
    }
  }
  return latest;
};

export const toRssXml = (
  items: FeedItem[],
  meta: FeedMeta
): string => {
  const entries = items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <dc:creator>${escapeXml(meta.author)}</dc:creator>
      <category>${escapeXml(item.category)}</category>
${item.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
      <pubDate>${toRfc822(item.published)}</pubDate>
    </item>`
    )
    .join("\n");

  const built = items.length > 0 ? latestUpdate(items) : new Date(0);

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <description>${escapeXml(meta.description)}</description>
    <link>${escapeXml(meta.siteUrl)}/</link>
    <language>${escapeXml(meta.language)}</language>
    <lastBuildDate>${toRfc822(built)}</lastBuildDate>
    <atom:link href="${escapeXml(meta.feedUrl)}" rel="self" type="application/rss+xml"/>
${entries}
  </channel>
</rss>
`;
};

/** JSON Feed 1.1 — https://jsonfeed.org/version/1.1 */
export const toJsonFeed = (
  items: FeedItem[],
  meta: FeedMeta
): string =>
  JSON.stringify(
    {
      authors: [{ name: meta.author, url: `${meta.siteUrl}/` }],
      description: meta.description,
      feed_url: meta.feedUrl,
      home_page_url: `${meta.siteUrl}/`,
      items: items.map((item) => ({
        date_modified: item.updated.toISOString(),
        date_published: item.published.toISOString(),
        id: item.url,
        summary: item.description,
        tags: [item.category, ...item.tags],
        title: item.title,
        url: item.url,
      })),
      language: meta.language,
      title: meta.title,
      version: "https://jsonfeed.org/version/1.1",
    },
    null,
    2
  );
