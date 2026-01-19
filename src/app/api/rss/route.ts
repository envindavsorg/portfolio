import GLOBAL_DATA from "@/content/data/global";
import { getAllPosts } from "@/lib/blog/posts";
import { dayjs } from "@/lib/utils";

export const dynamic = "force-static";

const escapeXml = (unsafe: string): string =>
  unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET = () => {
  const allPosts = getAllPosts();

  const itemsXml = allPosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[ ${post.metadata.title} ]]></title>
      <description><![CDATA[ ${post.metadata.description || ""} ]]></description>
      <link>https://cuzeacflorin.fr/blog/${post.slug}</link>
      <guid isPermaLink="false">https://cuzeacflorin.fr/blog/${post.slug}</guid>
      <dc:creator><![CDATA[ ${GLOBAL_DATA.USER.firstName} ]]></dc:creator>
      <pubDate>${dayjs(post.metadata.createdAt).format("ddd, DD MMM YYYY HH:mm:ss [GMT]")}</pubDate>
      <content:encoded>
        <p>${escapeXml(post.metadata.description || "")}</p>
        <div style="margin-top: 50px; font-style: italic;">
          <strong><a href="https://cuzeacflorin.fr/blog/${post.slug}">Continuer la lecture</a>.</strong>
        </div>
        <br />
        <br />
      </content:encoded>
    </item>`,
    )
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title><![CDATA[ Le coin de ${GLOBAL_DATA.USER.firstName} ]]></title>
    <description><![CDATA[ ${GLOBAL_DATA.USER.bio} ]]></description>
    <link>https://cuzeacflorin.fr/</link>
    <generator>RSS for Node</generator>
    <lastBuildDate>${dayjs().format("ddd, DD MMM YYYY HH:mm:ss [GMT]")}</lastBuildDate>
    <atom:link href="https://cuzeacflorin.fr/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
};
