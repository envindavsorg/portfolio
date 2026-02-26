import consola from 'consola';
import type { NextConfig } from 'next';
import { z } from 'zod';

(() => {
	const envSchema = z.object({
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
		GITHUB_API_TOKEN: z.string().min(1, 'gitHub API token is required !'),
		GITHUB_USERNAME: z.string().optional(),
		GITHUB_REPO_NAME: z.string().optional(),

		TURBO_TOKEN: z.string().optional(),
		TURBO_TEAM: z.string().optional(),

		BLOB_READ_WRITE_TOKEN: z.string().optional(),
		API_TOKEN: z.string().optional(),

		RESEND_API_KEY: z.string().optional(),
	});

	const parsed = envSchema.safeParse(process.env);

	if (!parsed.success) {
		consola.error('invalid environment variables :');
		consola.error(`${z.treeifyError(parsed.error)}\n`);
		process.exit(1);
	}

	if (!process.env.__ENV_VALIDATED) {
		consola.success(
			"environment variables look good ! you're safe to ship 🚀\n"
		);
		process.env.__ENV_VALIDATED = 'true';
	}
})();

const nextConfig: NextConfig = {
	reactStrictMode: true,
	transpilePackages: ['next-mdx-remote'],
	allowedDevOrigins: ['MacBook-Pro-16-M4-Max-de-Florin.local'],
	pageExtensions: ['mdx', 'ts', 'tsx'],
	devIndicators: false,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cuzeacflorin.fr',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
		],
		qualities: [75, 90, 100],
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	async rewrites() {
		return [
			{
				source: '/blog/:slug.mdx',
				destination: '/blog.mdx/:slug',
			},
			{
				source: '/components/:slug.mdx',
				destination: '/blog.mdx/:slug',
			},
		];
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=()',
					},
				],
			},
		];
	},
};

export default nextConfig;
