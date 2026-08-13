import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

import "./src/env";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/**
 * Content-Security-Policy.
 *
 * `script-src` garde `'unsafe-inline'`, et c'est un choix contraint, pas un
 * oubli : le App Router diffuse le payload RSC dans des dizaines de balises
 * <script> en ligne dont le contenu change à chaque page et à chaque build. Les
 * verrouiller demanderait un nonce par requête, donc un middleware, donc des
 * pages dynamiques — à l'opposé du parti pris tout-statique de ce site. Hacher
 * les scripts ne marche pas non plus, pour la même raison.
 *
 * La CSP reste donc muette sur le XSS par script en ligne, mais elle ferme
 * plusieurs autres portes bien réelles : `base-uri` (injection de <base>, qui
 * détourne toutes les URL relatives), `object-src` (greffons), `form-action`
 * (détournement de formulaire), `frame-ancestors` (clickjacking) et les origines
 * de chargement.
 */
const CSP_DIRECTIVES: Record<string, string[]> = {
  "base-uri": ["'self'"],
  // le test de débit interroge l'API de Cloudflare ; le reste est en même origine
  // (les scripts Vercel Analytics et Speed Insights passent par /_vercel/*)
  "connect-src": ["'self'", "https://speed.cloudflare.com"],
  "default-src": ["'self'"],
  "font-src": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "frame-src": ["'none'"],
  // blob: et data: pour le générateur de bannière (aperçu d'un fichier local
  // puis export canvas) ; les hôtes distants viennent de images.remotePatterns
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://images.unsplash.com",
    "https://picsum.photos",
  ],
  "manifest-src": ["'self'"],
  "media-src": ["'self'"],
  "object-src": ["'none'"],
  "script-src": ["'self'", "'unsafe-inline'"],
  // Next injecte des styles en ligne pour le CSS critique et next/font
  "style-src": ["'self'", "'unsafe-inline'"],
  "worker-src": ["'self'", "blob:"],
};

const contentSecurityPolicy = [
  ...Object.entries(CSP_DIRECTIVES).map(
    ([directive, sources]) => `${directive} ${sources.join(" ")}`
  ),
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["MacBook-Pro-16-M4-Max-de-Florin.local"],
  devIndicators: false,
  experimental: {
    globalNotFound: true,
    // radix-ui a été retiré des dépendances (migration Base UI) : le garder
    // ici n'optimisait plus rien
    optimizePackageImports: [
      "@phosphor-icons/react",
      "@base-ui/react",
      "motion",
    ],
  },
  async headers() {
    return [
      {
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            // `frame-ancestors` de la CSP le remplace pour les navigateurs
            // récents ; conservé pour les plus anciens
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
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
  /**
   * Anciens slugs de sujets anglais.
   *
   * Le frontmatter anglais traduisait la CLÉ du tag, ce qui produisait un second
   * jeu d'URL pour les mêmes sujets. Le tag est devenu une clé partagée et le
   * libellé seul est traduit — mais ces quatre URL ont été servies ET annoncées au
   * sitemap. Les laisser tomber en 404 casserait des liens déjà publiés et
   * indexés ; une redirection permanente transmet le peu d'autorité qu'elles ont
   * à l'URL canonique.
   */
  async redirects() {
    return [
      {
        destination: "/en/tags/carriere",
        permanent: true,
        source: "/en/tags/career",
      },
      {
        destination: "/en/tags/retour-d-experience",
        permanent: true,
        source: "/en/tags/lessons-learned",
      },
      {
        destination: "/en/tags/couleurs",
        permanent: true,
        source: "/en/tags/colors",
      },
      {
        destination: "/en/tags/texte",
        permanent: true,
        source: "/en/tags/text",
      },
    ];
  },
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
      // pendants anglais : sans eux, « Copy Markdown » sur /en renvoyait la
      // source française
      {
        destination: "/blog.en.mdx/:slug",
        source: "/en/articles/:slug.mdx",
      },
      {
        destination: "/blog.en.mdx/:slug",
        source: "/en/components/:slug.mdx",
      },
      {
        destination: "/blog.en.mdx/:slug",
        source: "/en/utils/:slug.mdx",
      },
    ];
  },
  transpilePackages: ["next-mdx-remote"],
};

export default withBundleAnalyzer(nextConfig);
