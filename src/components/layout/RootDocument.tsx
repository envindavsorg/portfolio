import { GeistMono } from "geist/font/mono";
import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
  GeistPixelTriangle,
} from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";
import { RscBoundaryProvider } from "rsc-boundary";

import { TooltipProvider } from "@/components/base/Tooltip";
import { LocaleProvider } from "@/components/providers/modules/LocaleProvider";
import { Providers } from "@/components/providers/Providers";
import GLOBAL_DATA from "@/data/global";
import { META_THEME_COLORS } from "@/data/theme";
import type { AppLocale } from "@/lib/i18n";
import { setServerLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const getJsonLd = (locale: AppLocale) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      alternateName: [GLOBAL_DATA.USER.username],
      description: GLOBAL_DATA.USER.bio,
      inLanguage: locale === "fr" ? "fr-FR" : "en-US",
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

interface RootDocumentProps {
  children: React.ReactNode;
  locale: AppLocale;
}

// Document racine partagé par les arbres de routes (fr)/ et en/ : pose le
// locale serveur (Paraglide) et rend la coquille html/body commune.
export const RootDocument = ({
  children,
  locale,
}: RootDocumentProps) => {
  setServerLocale(locale);

  return (
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
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: darkModeScript }}
          type="text/javascript"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getJsonLd(locale)).replaceAll(
              "<",
              "\\u003c"
            ),
          }}
          type="application/ld+json"
        />
      </head>

      <body className="font-pixel-square">
        {/* devtools de visualisation des frontières RSC, rend uniquement
            children en production */}
        <RscBoundaryProvider>
          <NuqsAdapter>
            <LocaleProvider locale={locale}>
              <Providers>
                <TooltipProvider>{children}</TooltipProvider>
              </Providers>
            </LocaleProvider>
          </NuqsAdapter>
        </RscBoundaryProvider>
      </body>
    </html>
  );
};
