import type { Metadata, Viewport } from "next";
import type React from "react";

import "../globals.css";
import { RootDocument } from "@/components/layout/RootDocument";
import { META_THEME_COLORS } from "@/data/theme";
import { createRootMetadata } from "@/lib/metadata";

export const metadata: Metadata = createRootMetadata("en");

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
  <RootDocument locale="en">{children}</RootDocument>
);

export default RootLayout;
