"use client";

import { AppProgressProvider } from "@bprogress/next";
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
