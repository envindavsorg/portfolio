"use client";

import { pauseOffScreen } from "@/lib/pause-off-screen";

/**
 * Composant client pour une seule raison : une `ref` ne traverse pas la
 * frontière d'un composant serveur, et c'est elle qui confie le halo à
 * l'observateur partagé. Le HTML servi est le même qu'avant.
 */
export const PulsatingCircle = () => (
  <span className="relative flex items-center justify-center">
    {/* `motion-safe` : le halo bat à l'infini, et rien ne l'arrêtait pour
        qui a demandé moins d'animations. Le point plein reste.
        `pauseOffScreen` : rien ne l'arrêtait non plus hors de l'écran. */}
    <span
      className="absolute inline-flex size-3 bg-theme opacity-50 motion-safe:animate-ping"
      ref={pauseOffScreen}
    />
    <span className="relative inline-flex size-2 bg-theme" />
  </span>
);
