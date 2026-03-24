import consola from "consola";
import type { NextConfig } from "next";
import { z } from "zod";

(() => {
  const envSchema = z.object({
    API_TOKEN: z.string().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    GITHUB_API_TOKEN: z
      .string()
      .min(1, "gitHub API token is required !"),
    GITHUB_REPO_NAME: z.string().optional(),

    GITHUB_USERNAME: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    RESEND_API_KEY: z.string().optional(),
    TURBO_TEAM: z.string().optional(),

    TURBO_TOKEN: z.string().optional(),
  });

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    consola.error("invalid environment variables :");
    consola.error(`${z.treeifyError(parsed.error)}\n`);
    process.exit(1);
  }

  if (!process.env.__ENV_VALIDATED) {
    consola.success(
      "environment variables look good ! you're safe to ship 🚀\n"
    );
    process.env.__ENV_VALIDATED = "true";
  }
})();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["MacBook-Pro-16-M4-Max-de-Florin.local"],
  devIndicators: false,
  async headers() {
    return [
      {
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
        source: "/(.*)",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "cuzeacflorin.fr",
        protocol: "https",
      },
      {
        hostname: "images.unsplash.com",
        protocol: "https",
      },
      {
        hostname: "picsum.photos",
        protocol: "https",
      },
    ],
    qualities: [75, 90, 100],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
  pageExtensions: ["mdx", "ts", "tsx"],
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        destination: "/blog.mdx/:slug",
        source: "/articles/:slug.mdx",
      },
      {
        destination: "/blog.mdx/:slug",
        source: "/components/:slug.mdx",
      },
      {
        destination: "/blog.mdx/:slug",
        source: "/utils/:slug.mdx",
      },
    ];
  },
  transpilePackages: ["next-mdx-remote"],
};

export default nextConfig;
