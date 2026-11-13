"use client";

import { MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import type React from "react";

import { TooltipProvider } from "@/components/base/Tooltip";
import { FaviconSwitcher } from "@/components/composites/FaviconSwitcher";

import { Analytics } from "./analytics/Analytics";
import ProgressProvider from "./modules/ProgressProvider";
import { ServiceWorker } from "./modules/ServiceWorker";
import ThemeProvider from "./modules/ThemeProvider";

const Toaster = dynamic(
  async () => {
    const mod = await import("@/components/primitives/Sonner");
    return mod.Toaster;
  },
  { ssr: false }
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
    <ThemeProvider>
      <ProgressProvider>
        <FaviconSwitcher />
        {/*
         * TooltipProvider est posé ICI, dans un module client, et non dans
         * RootDocument. `base/Tooltip.tsx` n'a pas de "use client" : importé
         * depuis un composant serveur, chaque export de @base-ui/react/tooltip
         * devenait une référence client à part entière, y compris l'outil de
         * débogage StoreInspector (8,7 Ko) dans le chunk partagé par toutes
         * les pages.
         */}
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />

        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <ServiceWorker />
          </>
        )}
      </ProgressProvider>
    </ThemeProvider>
  </MotionConfig>
);
