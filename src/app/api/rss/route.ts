import GLOBAL_DATA from "@/data/global";
import { getAllContent } from "@/lib/content";
import { BASE_URL } from "@/lib/metadata";

export const dynamic = "force-static";

/**
 * RSS 2.0 impose des dates RFC-822 en anglais. `dayjs` étant verrouillé sur la
 * locale FR, `format("ddd, DD MMM YYYY …")` produisait « mer., 12 août 2026 »,
 * que `Date.parse` — et donc les lecteurs de flux — rejette.
 * `toUTCString()` donne exactement le format attendu.
 */
const toRfc822 = (value: Date | number | string): string =>
  new Date(value).toUTCString();

const escapeXml = (unsafe: string): string =>
  unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const GET = () => {
  const allPosts = getAllContent();

  // date du contenu le plus récent plutôt que l'heure du build : la valeur
  // reste stable d'un déploiement à l'autre si rien n'a été publié.
  const lastBuildDate =
    allPosts
      .map((post) => new Date(post.metadata.updatedAt).getTime())
      .toSorted((a, b) => b - a)
      .at(0) ?? Date.now();

  const itemsXml = allPosts
    .map((post) => {
      const postUrl = `${BASE_URL}/${post.metadata.category}/${post.slug}`;

      return `
    <item>
      <title><![CDATA[ ${post.metadata.title} ]]></title>
      <description><![CDATA[ ${post.metadata.description || ""} ]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="false">${postUrl}</guid>
      <dc:creator><![CDATA[ ${GLOBAL_DATA.USER.firstName} ]]></dc:creator>
      <pubDate>${toRfc822(post.metadata.createdAt)}</pubDate>
      <content:encoded>
        <p>${escapeXml(post.metadata.description || "")}</p>
        <div style="margin-top: 50px; font-style: italic;">
          <strong><a href="${postUrl}">Continuer la lecture</a>.</strong>
        </div>
        <br />
        <br />
      </content:encoded>
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title><![CDATA[ Le coin de ${GLOBAL_DATA.USER.firstName} ]]></title>
    <description><![CDATA[ ${GLOBAL_DATA.USER.bio} ]]></description>
    <link>${BASE_URL}/</link>
    <generator>RSS for Node</generator>
    <language>fr</language>
    <lastBuildDate>${toRfc822(lastBuildDate)}</lastBuildDate>
    <atom:link href="${BASE_URL}/api/rss" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
};
