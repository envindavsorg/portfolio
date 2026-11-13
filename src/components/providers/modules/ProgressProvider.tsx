"use client";

// l'entrée `/app`, pas la racine : celle-ci réexporte aussi le fournisseur du
// Pages Router, et 18 à 24 Kio de routeur inutilisé partaient sur chaque page
import { ProgressProvider as AppProgressProvider } from "@bprogress/next/app";
import type React from "react";

interface AppProgressProviderProps {
  children: React.ReactNode;
}

const ProgressProvider = ({
  children,
  ...props
}: AppProgressProviderProps) => (
  <AppProgressProvider
    color="var(--color-theme)"
    delay={500}
    height="2px"
    options={{
      showSpinner: false,
    }}
    {...props}
  >
    {children}
  </AppProgressProvider>
);

export default ProgressProvider;
