import type { Metadata } from "next";
import type React from "react";

import { PageColumn } from "@/components/layout/PageColumn";

// pas de `title` ici : un gabarit déclaré par ce layout remplacerait celui du
// layout racine (`TITLE_TEMPLATE`), et les écrits perdraient le nom du site
export const metadata: Metadata = {
  description:
    "Explorations techniques sur React, Next.js et TypeScript : articles, composants réutilisables et outils pour le développement web moderne.",
};

type DocsLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const WritingsLayout = ({ children }: DocsLayoutProps) => (
  <PageColumn>{children}</PageColumn>
);

export default WritingsLayout;
