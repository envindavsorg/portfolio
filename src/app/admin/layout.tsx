import type { Metadata, Viewport } from "next";
import type React from "react";

import "../globals.css";
import { RootDocument } from "@/components/layout/RootDocument";
import { META_THEME_COLORS } from "@/data/theme";

/**
 * Troisième racine de l'application, à côté de `(fr)` et `en`.
 *
 * L'espace d'administration n'appartient à aucun des deux arbres de langue : il
 * n'est ni traduit ni indexé, et il ne doit pas hériter du chrome du site
 * (barre de navigation, pied de page, particules). Il lui faut donc son propre
 * `<html>`, ce que fournit `RootDocument`.
 *
 * `noindex, nofollow` est doublé par une règle `disallow` dans `robots.ts` : un
 * en-tête que le robot lit APRÈS avoir chargé la page ne l'empêche pas de la
 * charger, et l'espace admin n'a aucune raison d'être visité par un robot.
 */
export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "administration",
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: META_THEME_COLORS.light,
  width: "device-width",
};

const AdminRootLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => (
  <RootDocument locale="fr">{children}</RootDocument>
);

export default AdminRootLayout;
