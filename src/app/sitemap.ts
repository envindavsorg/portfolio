import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';

const CATEGORY_ROUTES: Record<string, string> = {
	article: 'blog',
	components: 'components',
	utils: 'utils',
};

const sitemap = (): MetadataRoute.Sitemap => {
	const allPosts = getAllPosts();

	const articles = allPosts.filter((p) => (p.metadata.category ?? 'article') === 'article');
	const components = allPosts.filter((p) => p.metadata.category === 'components');
	const utils = allPosts.filter((p) => p.metadata.category === 'utils');

	const getLatestDate = (posts: typeof allPosts) => {
		if (posts.length === 0) {
			return dayjs().toISOString();
		}

		return dayjs(posts[0].metadata.updatedAt).toISOString();
	};

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: 'https://cuzeacflorin.fr',
			lastModified: getLatestDate(allPosts),
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://cuzeacflorin.fr/blog',
			lastModified: getLatestDate(articles),
			changeFrequency: 'daily',
			priority: 0.8,
		},
		{
			url: 'https://cuzeacflorin.fr/components',
			lastModified: getLatestDate(components),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: 'https://cuzeacflorin.fr/utils',
			lastModified: getLatestDate(utils),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
	];

	const mapPostsToSitemap = (posts: typeof allPosts, routeBase: string): MetadataRoute.Sitemap =>
		posts.map((post) => ({
			url: `https://cuzeacflorin.fr/${routeBase}/${post.slug}`,
			lastModified: dayjs(post.metadata.updatedAt).toISOString(),
			changeFrequency: 'weekly',
			priority: 0.6,
		}));

	const articleUrls = mapPostsToSitemap(articles, CATEGORY_ROUTES.article);
	const componentUrls = mapPostsToSitemap(components, CATEGORY_ROUTES.components);
	const utilUrls = mapPostsToSitemap(utils, CATEGORY_ROUTES.utils);

	return [...staticRoutes, ...articleUrls, ...componentUrls, ...utilUrls];
};

export default sitemap;
