import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
	rules: [
		{
			userAgent: '*',
			disallow: ['/api/*', '/ingest/*'],
		},
	],
	sitemap: 'https://cuzeacflorin.fr/sitemap.xml',
});

export default robots;
