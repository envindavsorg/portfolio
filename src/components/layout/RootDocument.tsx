import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";

import { TooltipProvider } from "@/components/base/Tooltip";
import { LocaleProvider } from "@/components/providers/modules/LocaleProvider";
import { Providers } from "@/components/providers/Providers";
import { META_THEME_COLORS } from "@/data/theme";
import {
  PixelCircle,
  PixelGrid,
  PixelLine,
  PixelSquare,
  PixelTriangle,
} from "@/fonts/pixel";
import type { AppLocale } from "@/lib/i18n";
import { setServerLocale } from "@/lib/i18n";
import { getSiteJsonLd } from "@/lib/json-ld";
import { cn } from "@/lib/utils";

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
        PixelSquare.variable,
        // déclarées sans preload : décoratives, elles ne servent qu'à l'effet
        // de défilement de PixelHeading
        PixelGrid.variable,
        PixelCircle.variable,
        PixelTriangle.variable,
        PixelLine.variable
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
            __html: JSON.stringify(getSiteJsonLd(locale)).replaceAll(
              "<",
              "\\u003c"
            ),
          }}
          type="application/ld+json"
        />
      </head>

      <body className="font-pixel-square">
        <NuqsAdapter>
          <LocaleProvider locale={locale}>
            <Providers>
              <TooltipProvider>{children}</TooltipProvider>
            </Providers>
          </LocaleProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
};
