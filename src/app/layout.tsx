import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import type React from "react";
import ConsentManager from "@/components/manager/ConsentManager";
import GLOBAL_DATA from "@/content/data/global";
import { META_THEME_COLORS } from "@/content/data/theme";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers/Providers";

const getJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: GLOBAL_DATA.USER.fullName,
      url: GLOBAL_DATA.SOCIAL.portfolio,
      description: GLOBAL_DATA.USER.bio,
      inLanguage: "fr-FR",
      alternateName: [GLOBAL_DATA.USER.username],
    },
    {
      "@type": "Person",
      name: GLOBAL_DATA.USER.fullName,
      url: GLOBAL_DATA.SOCIAL.portfolio,
      jobTitle: GLOBAL_DATA.WORK.title,
      sameAs: [GLOBAL_DATA.SOCIAL.github, GLOBAL_DATA.SOCIAL.linkedin].filter(
        Boolean,
      ),
      knowsAbout: ["React", "Next.js", "TypeScript"],
    },
  ],
});

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["Consolas", "Monaco", "monospace"],
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
  metadataBase: "https://cuzeacflorin.fr",
  alternates: {
    canonical: "/",
  },
  title: {
    template: "%s - Développeur Full-Stack – Portfolio personnel",
    default: GLOBAL_DATA.USER.fullName,
  },
  description: GLOBAL_DATA.USER.bio,
  keywords: GLOBAL_DATA.keywords,
  authors: [
    {
      name: "envindavsorg",
      url: "https://cuzeacflorin.fr",
    },
  ],
  creator: "envindavsorg",
  openGraph: {
    siteName: GLOBAL_DATA.USER.fullName,
    url: "/",
    type: "profile",
    firstName: GLOBAL_DATA.USER.firstName,
    lastName: GLOBAL_DATA.USER.lastName,
    username: GLOBAL_DATA.USER.username,
    gender: GLOBAL_DATA.USER.gender,
    images: [
      {
        url: GLOBAL_DATA.USER.og,
        width: 1200,
        height: 630,
        alt: GLOBAL_DATA.USER.fullName,
      },
    ],
  },
  icons: {
    icon: [
      {
        url: "/favicons/favicon-light.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicons/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      type: "image/png",
      sizes: "180x180",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: META_THEME_COLORS.light,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html
    className={cn(
      "no-scrollbar h-full antialiased",
      sans.variable,
      mono.variable,
    )}
    lang="en"
    suppressHydrationWarning
  >
    <head>
      <script
        dangerouslySetInnerHTML={{ __html: darkModeScript }}
        type="text/javascript"
      />
      <Script src={`data:text/javascript;base64,${btoa(darkModeScript)}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getJsonLd()).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
    </head>

    <body>
      <Providers>
        <ConsentManager>{children}</ConsentManager>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
