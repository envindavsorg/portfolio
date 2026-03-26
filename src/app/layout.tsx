import { GeistMono } from "geist/font/mono";
import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
  GeistPixelTriangle,
} from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import type React from "react";

import "./globals.css";
import { TooltipProvider } from "@/components/base/Tooltip";
import { Providers } from "@/components/providers/Providers";
import GLOBAL_DATA from "@/data/global";
import { META_THEME_COLORS } from "@/data/theme";
import { cn } from "@/lib/utils";

const getJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      alternateName: [GLOBAL_DATA.USER.username],
      description: GLOBAL_DATA.USER.bio,
      inLanguage: "fr-FR",
      name: GLOBAL_DATA.USER.fullName,
      url: GLOBAL_DATA.SOCIAL.portfolio,
    },
    {
      "@type": "Person",
      jobTitle: GLOBAL_DATA.WORK.title,
      knowsAbout: ["React", "Next.js", "TypeScript"],
      name: GLOBAL_DATA.USER.fullName,
      sameAs: [
        GLOBAL_DATA.SOCIAL.github,
        GLOBAL_DATA.SOCIAL.linkedin,
      ].filter(Boolean),
      url: GLOBAL_DATA.SOCIAL.portfolio,
    },
  ],
});

const darkModeScript = `
	try {
        const isDark = localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
        }

        // Change all favicon links based on theme
        const faviconUrl = isDark ? '/favicons/favicon-dark.ico' : '/favicons/favicon-light.ico';
        document.querySelectorAll('link[rel="icon"]').forEach(function(link) {
            link.href = faviconUrl;
        });
    } catch (_) {}

    try {
        if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
            document.documentElement.classList.add('os-macos')
        }
    } catch (_) {}
`;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  authors: [
    {
      name: "envindavsorg",
      url: "https://cuzeacflorin.fr",
    },
  ],
  creator: "envindavsorg",
  description: GLOBAL_DATA.USER.description,
  icons: {
    apple: {
      sizes: "180x180",
      type: "image/png",
      url: "/apple-touch-icon.png",
    },
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicons/favicon-light.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicons/favicon-dark.ico",
      },
    ],
  },
  keywords: GLOBAL_DATA.keywords,
  metadataBase: "https://cuzeacflorin.fr",
  openGraph: {
    firstName: GLOBAL_DATA.USER.firstName,
    gender: GLOBAL_DATA.USER.gender,
    images: [
      {
        alt: GLOBAL_DATA.USER.fullName,
        height: 630,
        url: GLOBAL_DATA.USER.og,
        width: 1200,
      },
    ],
    lastName: GLOBAL_DATA.USER.lastName,
    siteName: GLOBAL_DATA.USER.fullName,
    type: "profile",
    url: "/",
    username: GLOBAL_DATA.USER.username,
  },
  title: {
    default: GLOBAL_DATA.USER.fullName,
    template: "%s - Développeur Full-Stack – Portfolio personnel",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: META_THEME_COLORS.light,
  viewportFit: "cover",
  width: "device-width",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html
    className={cn(
      "no-scrollbar h-full antialiased",
      GeistSans.variable,
      GeistMono.variable,
      GeistPixelSquare.variable,
      GeistPixelGrid.variable,
      GeistPixelCircle.variable,
      GeistPixelTriangle.variable,
      GeistPixelLine.variable
    )}
    lang="fr"
    suppressHydrationWarning
  >
    <head>
      <script
        dangerouslySetInnerHTML={{ __html: darkModeScript }}
        type="text/javascript"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getJsonLd()).replaceAll(
            "<",
            "\\u003c"
          ),
        }}
        type="application/ld+json"
      />
    </head>

    <body className="font-pixel-square">
      <Providers>
        <TooltipProvider>{children}</TooltipProvider>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
