import localFont from "next/font/local";

/**
 * Polices pixel décoratives, déclarées ici plutôt qu'importées de `geist`.
 *
 * Le paquet `geist` les configure avec le `preload: true` par défaut de
 * `next/font/local` : les quatre étaient donc préchargées sur CHAQUE page, soit
 * environ 103 ko, alors qu'elles ne servent qu'à l'effet de défilement de
 * PixelHeading. Square est déclarée ici aussi, et préchargée : importer
 * `geist/font/pixel` ne serait-ce que pour elle évalue les CINQ appels
 * `localFont()` du module, et réintroduit donc les quatre préchargements.
 *
 * Les noms de variables CSS sont identiques à ceux de `geist`, les classes
 * Tailwind `font-pixel-*` continuent donc de fonctionner sans changement.
 *
 * La liste de repli est répétée à chaque appel : `next/font/local` est compilé
 * au build et n'accepte que des littéraux, pas une constante partagée.
 */

export const PixelGrid = localFont({
  adjustFontFallback: false,
  fallback: [
    "Geist Mono",
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
  preload: false,
  src: "./geist-pixel/GeistPixel-Grid.woff2",
  variable: "--font-geist-pixel-grid",
  weight: "500",
});

export const PixelCircle = localFont({
  adjustFontFallback: false,
  fallback: [
    "Geist Mono",
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
  preload: false,
  src: "./geist-pixel/GeistPixel-Circle.woff2",
  variable: "--font-geist-pixel-circle",
  weight: "500",
});

export const PixelTriangle = localFont({
  adjustFontFallback: false,
  fallback: [
    "Geist Mono",
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
  preload: false,
  src: "./geist-pixel/GeistPixel-Triangle.woff2",
  variable: "--font-geist-pixel-triangle",
  weight: "500",
});

export const PixelLine = localFont({
  adjustFontFallback: false,
  fallback: [
    "Geist Mono",
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
  preload: false,
  src: "./geist-pixel/GeistPixel-Line.woff2",
  variable: "--font-geist-pixel-line",
  weight: "500",
});

/** seule police pixel utilisée dans l'interface : préchargée */
export const PixelSquare = localFont({
  adjustFontFallback: false,
  fallback: [
    "Geist Mono",
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
  preload: true,
  src: "./geist-pixel/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel-square",
  weight: "500",
});
