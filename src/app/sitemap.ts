import type { MetadataRoute } from "next";

import { CERTS } from "@/app/(fr)/(content)/(root)/_components/certs/content";
import { getAllContent } from "@/lib/content";
import { dayjs } from "@/lib/functions";
import { getSeriesIndex } from "@/lib/series";
import { getContentByTagSlug, getTagIndex } from "@/lib/tags";

const BASE_URL = "https://cuzeacflorin.fr";

const CATEGORY_ROUTES: Record<string, string> = {
  articles: "articles",
  components: "components",
  utils: "utils",
};

// path SANS préfixe de locale, ex. "/articles" ou "" pour la racine
const toUrl = (path: string, locale: "fr" | "en") =>
  locale === "fr" ? `${BASE_URL}${path}` : `${BASE_URL}/en${path}`;

const localizedEntries = (
  path: string,
  entry: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap => {
  const alternates = {
    languages: {
      en: toUrl(path, "en"),
      fr: toUrl(path, "fr"),
      // aligné sur createMetadata() : sans x-default, Google choisit lui-même
      // la version servie aux locales non couvertes
      "x-default": toUrl(path, "fr"),
    },
  };

  return [
    { ...entry, alternates, url: toUrl(path, "fr") },
    { ...entry, alternates, url: toUrl(path, "en") },
  ];
};

/**
 * Une entrée pour UNE seule locale, sans `alternates`.
 *
 * Déclarer un `hreflang` vers une URL qui n'existe pas est pire que de ne rien
 * déclarer. Le sitemap annonçait un équivalent anglais pour CHAQUE sujet
 * français, dont deux (`carriere`, `retour-d-experience`) étaient prérendus en
 * 404 sous /en, parce que le vocabulaire de tags divergeait alors entre les
 * locales.
 *
 * Depuis que le tag est une clé partagée, plus aucun sujet n'emprunte ce chemin.
 * Il reste parce que la garantie ne vient pas du contenu actuel : un futur
 * article non traduit retomberait sur le FR et pourrait faire réapparaître un
 * sujet dans une seule locale.
 */
const singleEntry = (
  path: string,
  locale: "fr" | "en",
  entry: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap => [{ ...entry, url: toUrl(path, locale) }];

const getLatestDate = (posts: ReturnType<typeof getAllContent>) => {
  if (posts.length === 0) {
    return dayjs().toISOString();
  }

  // getAllContent trie par createdAt : le premier élément n'est pas forcément
  // le plus récemment mis à jour, il faut chercher le maximum
  const latest = Math.max(
    ...posts.map((post) =>
      new Date(post.metadata.updatedAt).getTime()
    )
  );

  return dayjs(latest).toISOString();
};

const sitemap = (): MetadataRoute.Sitemap => {
  const allPosts = getAllContent();

  const articles = allPosts.filter(
    (p) => p.metadata.category === "articles"
  );
  const components = allPosts.filter(
    (p) => p.metadata.category === "components"
  );
  const utils = allPosts.filter(
    (p) => p.metadata.category === "utils"
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    ...localizedEntries("", {
      changeFrequency: "daily",
      lastModified: getLatestDate(allPosts),
      priority: 1,
    }),
    ...localizedEntries("/articles", {
      changeFrequency: "daily",
      lastModified: getLatestDate(articles),
      priority: 0.8,
    }),
    ...localizedEntries("/components", {
      changeFrequency: "weekly",
      lastModified: getLatestDate(components),
      priority: 0.8,
    }),
    ...localizedEntries("/utils", {
      changeFrequency: "weekly",
      lastModified: getLatestDate(utils),
      priority: 0.8,
    }),
    ...localizedEntries("/tags", {
      changeFrequency: "weekly",
      lastModified: getLatestDate(allPosts),
      priority: 0.6,
    }),
    // la date du CV est celle de la certification la plus récente : ni
    // `dayjs()`, qui changerait à chaque build et mentirait aux crawlers, ni la
    // date d'un article, qui n'a rien à voir avec un parcours
    ...localizedEntries("/cv", {
      changeFrequency: "monthly",
      lastModified: dayjs(
        Math.max(
          ...CERTS.map((cert) => new Date(cert.issueDate).getTime())
        )
      ).toISOString(),
      priority: 0.7,
    }),
    ...localizedEntries("/search", {
      changeFrequency: "weekly",
      lastModified: getLatestDate(allPosts),
      priority: 0.4,
    }),
    ...localizedEntries("/series", {
      changeFrequency: "weekly",
      lastModified: getLatestDate(allPosts),
      priority: 0.6,
    }),
  ];

  // la date de la série est celle de sa partie la plus récente : une série
  // complétée doit ressortir comme mise à jour
  const seriesUrls: MetadataRoute.Sitemap = getSeriesIndex(
    allPosts
  ).flatMap((series) =>
    localizedEntries(`/series/${series.slug}`, {
      changeFrequency: "weekly",
      lastModified: getLatestDate(series.parts),
      priority: 0.6,
    })
  );

  // les pages de sujet sont la principale surface de découverte transversale :
  // sans elles au sitemap, elles ne seraient atteignables que par navigation.
  //
  // Le vocabulaire est désormais PARTAGÉ : un tag est une clé, seul son libellé
  // est traduit, donc les deux index produisent les mêmes slugs et chaque sujet
  // sort avec sa paire hreflang. Le calcul par locale et la comparaison des
  // ensembles restent : ils ne coûtent rien et referment le trou tout seuls si un
  // contenu non traduit réintroduit un jour un sujet propre à une langue.
  const enPosts = getAllContent("en");
  const frTagIndex = getTagIndex(allPosts, "fr");
  const enTagIndex = getTagIndex(enPosts, "en");
  const frTagSlugs = new Set(frTagIndex.map((tag) => tag.slug));
  const enTagSlugs = new Set(enTagIndex.map((tag) => tag.slug));

  const tagEntry = (posts: typeof allPosts) => ({
    changeFrequency: "weekly" as const,
    lastModified: getLatestDate(posts),
    priority: 0.5,
  });

  const tagUrls: MetadataRoute.Sitemap = [
    ...frTagIndex.flatMap((tag) => {
      const path = `/tags/${tag.slug}`;
      const entry = tagEntry(getContentByTagSlug(allPosts, tag.slug));

      return enTagSlugs.has(tag.slug)
        ? localizedEntries(path, entry)
        : singleEntry(path, "fr", entry);
    }),
    // les sujets propres à l'anglais n'apparaissaient dans aucun sitemap, et
    // n'étaient prérendus nulle part, alors que les articles EN les lient
    ...enTagIndex
      .filter((tag) => !frTagSlugs.has(tag.slug))
      .flatMap((tag) =>
        singleEntry(
          `/tags/${tag.slug}`,
          "en",
          tagEntry(getContentByTagSlug(enPosts, tag.slug))
        )
      ),
  ];

  const mapPostsToSitemap = (
    posts: typeof allPosts,
    routeBase: string
  ): MetadataRoute.Sitemap =>
    posts.flatMap((post) =>
      localizedEntries(`/${routeBase}/${post.slug}`, {
        changeFrequency: "weekly",
        lastModified: dayjs(post.metadata.updatedAt).toISOString(),
        priority: 0.6,
      })
    );

  const articleUrls = mapPostsToSitemap(
    articles,
    CATEGORY_ROUTES.articles
  );
  const componentUrls = mapPostsToSitemap(
    components,
    CATEGORY_ROUTES.components
  );
  const utilUrls = mapPostsToSitemap(utils, CATEGORY_ROUTES.utils);

  return [
    ...staticRoutes,
    ...articleUrls,
    ...componentUrls,
    ...utilUrls,
    ...tagUrls,
    ...seriesUrls,
  ];
};

export default sitemap;
