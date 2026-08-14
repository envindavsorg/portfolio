"use client";

import { MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import type React from "react";

import { FaviconSwitcher } from "@/components/composites/FaviconSwitcher";

import { Analytics } from "./analytics/Analytics";
import ProgressProvider from "./modules/ProgressProvider";
import { ServiceWorker } from "./modules/ServiceWorker";
import ThemeProvider from "./modules/ThemeProvider";
import type { Provider } from "./utils/Compose";
import { Compose } from "./utils/Compose";

const Toaster = dynamic(
  async () => {
    const mod = await import("@/components/primitives/Sonner");
    return mod.Toaster;
  },
  { ssr: false }
);

const AppProviders: Provider = Compose(
  ThemeProvider,
  ProgressProvider
);

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
  /**
   * `reducedMotion="user"` : 62 fichiers importent motion/react, 7 seulement
   * consultaient la préférence — et cinq de ces sept sont des effets canvas ou
   * CSS, pas des composants Motion. Le balayage plein écran de 0,8 s au
   * changement de thème n'avait donc aucune garde.
   *
   * MotionConfig laisse passer l'opacité, ce qui est le comportement voulu : ce
   * sont les déplacements et les mises à l'échelle qui gênent. Les cinq gardes
   * existantes restent en place, elles couvrent ce que Motion ne voit pas.
   */
  <MotionConfig reducedMotion="user">
    <AppProviders>
      <FaviconSwitcher />
      {children}
      <Toaster />

      {process.env.NODE_ENV === "production" && (
        <>
          <Analytics />
          <ServiceWorker />
        </>
      )}
    </AppProviders>
  </MotionConfig>
);
