import localFont from "next/font/local";

/**
 * Geist Sans, déclarée ici plutôt qu'importée de `geist/font/sans`.
 *
 * Le paquet la configure avec le `preload: true` par défaut de
 * `next/font/local` : 68 Kio préchargés sur CHAQUE page, pour une police que le
 * site ne rend qu'à un endroit — le libellé du sélecteur de police du
 * générateur de bannière. Partout ailleurs `document.fonts` la donnait
 * « unloaded » après chargement et défilement : téléchargée, jamais dessinée.
 *
 * Sans préchargement, le navigateur ne la demande que si un texte s'en sert.
 * Le nom de variable CSS est celui de `geist`, `font-sans` ne change donc pas ;
 * le fichier vient du même paquet (`dist/fonts/geist-sans`, licence OFL dans
 * `./LICENSE.txt`).
 */
export const GeistSans = localFont({
  preload: false,
  src: "./geist/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});
