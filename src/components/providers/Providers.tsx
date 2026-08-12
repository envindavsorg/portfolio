"use client";

import dynamic from "next/dynamic";
import type React from "react";

import { FaviconSwitcher } from "@/components/composites/FaviconSwitcher";

import { Analytics } from "./analytics/Analytics";
import ProgressProvider from "./modules/ProgressProvider";
import { ServiceWorker } from "./modules/ServiceWorker";
import ThemeProvider from "./modules/ThemeProvider";
import { Compose } from "./utils/Compose";
import type { Provider } from "./utils/Compose";

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
);
