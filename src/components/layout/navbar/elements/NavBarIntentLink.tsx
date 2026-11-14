"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useState } from "react";

type NavBarIntentLinkProps = Omit<
  ComponentProps<typeof Link>,
  "onFocus" | "onPointerEnter" | "prefetch"
>;

/**
 * Lien qui ne précharge sa cible qu'à l'intention : survol ou focus.
 *
 * Le logo et « accueil » mènent à la page la plus lourde du site. Préchargée
 * dès l'affichage, elle était téléchargée sur CHAQUE page vue (54 Kio de RSC,
 * puis ses chunks) pour des visiteurs qui, pour la plupart, n'y retournent pas.
 * `null` rend la main au comportement par défaut de Next une fois l'intention
 * exprimée : c'est le motif HoverPrefetchLink de sa documentation.
 */
export const NavBarIntentLink = (props: NavBarIntentLinkProps) => {
  const [hasIntent, setHasIntent] = useState(false);
  const showIntent = () => setHasIntent(true);

  return (
    <Link
      {...props}
      onFocus={showIntent}
      onPointerEnter={showIntent}
      prefetch={hasIntent ? null : false}
    />
  );
};
