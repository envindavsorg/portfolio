import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

import "./src/env";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ["MacBook-Pro-16-M4-Max-de-Florin.local"],
  devIndicators: false,
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ["@phosphor-icons/react", "radix-ui"],
  },
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
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
    dangerouslyAllowSVG: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ["image/avif", "image/webp"],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [75, 90, 100],
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
  },
  pageExtensions: ["mdx", "ts", "tsx"],
  reactCompiler: true,
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

export default withBundleAnalyzer(nextConfig);
