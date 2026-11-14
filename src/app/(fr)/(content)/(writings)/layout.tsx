import type { Metadata } from "next";
import type React from "react";

import { PageColumn } from "@/components/layout/PageColumn";

export const metadata: Metadata = {
  description:
    "Explorations techniques sur React, Next.js et TypeScript : articles, composants réutilisables et outils pour le développement web moderne.",
  title: {
    default: "Articles",
    template: "%s | Articles, composants et outils web",
  },
};

type DocsLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const WritingsLayout = ({ children }: DocsLayoutProps) => (
  <PageColumn>{children}</PageColumn>
);

export default WritingsLayout;
