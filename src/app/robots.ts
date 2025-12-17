import type { MetadataRoute } from 'next';
import { SITE_INFO } from '@/config/site';

const robots = (): MetadataRoute.Robots => ({
	rules: [{ userAgent: '*' }],
	sitemap: `${SITE_INFO.url}/sitemap.xml`,
});

export default robots;
