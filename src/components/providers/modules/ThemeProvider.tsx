"use client";

import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from "next-themes";
import type React from "react";
import { useEffect } from "react";

const THEME_CLASSES = ["light", "dark"];

/**
 * Table de correspondance VIDE, et c'est ce qui compte : avec elle, le script
 * en ligne de next-themes pose toujours la classe du thème avant le premier
 * rendu (il se replie sur le nom du thème), mais son code React ne touche plus
 * à la classe — c'est `ThemeClass` qui s'en charge, et seulement quand elle
 * change. `e2e/load-stability.spec.ts` échoue si une version de next-themes
 * cesse de se comporter ainsi.
 *
 * SANS PROTOTYPE. Avec un `{}`, un thème enregistré qui porte le nom d'une
 * propriété d'`Object.prototype` — `constructor`, `toString`, `__proto__` —
 * trouvait une valeur dans la table : next-themes passait alors une fonction
 * à `classList.add`, qui levait dans un effet, et la page entière cédait la
 * place à l'écran d'erreur. La valeur doit être écrite à la main, par une
 * extension ou par une autre application sur la même origine ; il suffit
 * d'une fois. `JSON.stringify` rend toujours `{}` : le script en ligne ne
 * change pas.
 */
const NO_CLASS_FROM_NEXT_THEMES: Record<string, string> =
  Object.create(null);

/**
 * Coupe les transitions le temps d'un changement de thème, comme le faisait
 * `disableTransitionOnChange` : sans cela, chaque couleur animée glisserait
 * d'un thème à l'autre au lieu de basculer.
 */
const suspendTransitions = () => {
  const style = document.createElement("style");
  style.append("*,*::before,*::after{transition:none!important}");
  document.head.append(style);

  return () => {
    setTimeout(() => style.remove(), 1);
  };
};

/**
 * Pose la classe du thème sur `<html>` — quand elle change, pas au montage.
 *
 * next-themes réappliquait le thème à chaque montage : il retirait puis
 * remettait la classe que son propre script venait de poser, et, avec
 * `disableTransitionOnChange`, ajoutait puis retirait une feuille
 * `*{transition:none}`. Rien ne changeait à l'écran, mais chacune de ces
 * écritures invalide le style du document ENTIER : la première lecture de
 * mise en page venue ensuite le recalculait en pleine hydratation (2 900
 * éléments sur l'accueil), et le retrait de la feuille le faisait recalculer
 * une seconde fois juste après. Mesuré en neutralisant ces écritures, profil
 * téléphone : la tâche d'hydratation passe de 456-580 ms à 356-395 ms, le
 * temps de blocage total de 911-1035 ms à 628-873 ms.
 *
 * Les effets d'un enfant passent avant ceux de son parent : au changement de
 * thème, la classe est donc posée ici avant que next-themes n'écrive
 * `color-scheme`, dans la même validation React.
 */
const ThemeClass = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const { classList } = document.documentElement;
    if (!resolvedTheme || classList.contains(resolvedTheme)) {
      return;
    }

    const resumeTransitions = suspendTransitions();
    classList.remove(...THEME_CLASSES);
    classList.add(resolvedTheme);
    resumeTransitions();
  }, [resolvedTheme]);

  return null;
};

interface AppThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider = ({
  children,
  ...props
}: AppThemeProviderProps) => (
  <AppThemeProvider
    attribute="class"
    defaultTheme="system"
    enableColorScheme
    enableSystem
    storageKey="theme"
    value={NO_CLASS_FROM_NEXT_THEMES}
    {...props}
  >
    <ThemeClass />
    {children}
  </AppThemeProvider>
);

export default ThemeProvider;
