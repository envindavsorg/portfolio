import type { Metadata } from "next";

import "./globals.css";
import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { RootDocument } from "@/components/layout/RootDocument";

export const metadata: Metadata = {
  description: "Cette page n'existe pas.",
  title: "404 - Page introuvable",
};

// 404 global (URLs ne correspondant à aucune route) — requis car le projet
// utilise plusieurs root layouts ((fr)/ et en/), il porte donc son propre html.
const GlobalNotFound = () => (
  <RootDocument locale="fr">
    <NotFoundContent />
  </RootDocument>
);

export default GlobalNotFound;
