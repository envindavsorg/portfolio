import localFont from "next/font/local";

/**
 * Geist Mono, déclarée ici plutôt qu'importée de `geist/font/mono` — même nom
 * de variable CSS, même liste de repli, le paquet `geist` n'est plus requis.
 *
 * Elle RESTE préchargée, et c'est un choix par défaut plus qu'un état voulu.
 * Seules les pages de contenu dessinent du code : /articles/<slug>,
 * /components/<slug>, /utils/<slug>. L'accueil, les listes, le CV reçoivent
 * donc 70 Kio dont ils n'affichent pas un caractère. Mais retirer le
 * préchargement ici le retire PARTOUT, et un bloc de code s'afficherait alors
 * dans la police à chasse fixe du système avant de basculer sous les yeux du
 * lecteur.
 *
 * La sortie propre : `next/font` rattache un préchargement à l'entrée (layout
 * ou page) dont le graphe de modules contient l'appel `localFont()`. Une
 * seconde déclaration préchargée, importée par le seul rendu MDX, limiterait
 * donc le préchargement aux trois vues de contenu — et celle-ci pourrait
 * passer à `preload: false`. Ne PAS ajouter cette seconde déclaration dans ce
 * fichier : le document racine l'importe, elle serait préchargée partout.
 */
export const GeistMono = localFont({
  adjustFontFallback: false,
  fallback: [
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
  src: "./geist/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});
