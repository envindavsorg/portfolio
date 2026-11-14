"use client";

import { loadBasic } from "@tsparticles/basic";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { loadExternalPushInteraction } from "@tsparticles/interaction-external-push";
import { loadInteractivityPlugin } from "@tsparticles/plugin-interactivity";
import { Particles, ParticlesProvider } from "@tsparticles/react";

/**
 * Tout tsParticles derrière UN SEUL point d'entrée.
 *
 * `Particles.tsx` importait ses paquets un par un, chacun par son propre
 * `import()`. Turbopack ouvre un groupe de chunks par import dynamique et
 * RECOPIE dans chacun les modules qu'ils ont en commun : le moteur se
 * retrouvait dans trois chunks, le greffon d'interactivité dans deux. Mesuré
 * sur ce site : quatre imports, 134 Ko (45 Kio gzip) ; un seul, 110 Ko (36 Kio).
 * Ce module n'existe que pour ça — ne pas le « simplifier » en remettant les
 * `import()` côte à côte dans `Particles.tsx`.
 *
 * `basic` + le seul mode d'interaction utilisé, et non `slim`. L'effet se résume
 * à des cercles qui dérivent, dont l'opacité varie, et à un clic qui en ajoute
 * deux ; `slim` enregistrait en plus quinze interactions, six formes et trois
 * modificateurs dont aucune option ne se sert.
 *
 * L'ordre compte : une interaction refuse de s'enregistrer tant que le greffon
 * d'interactivité n'est pas chargé.
 */
const registerEngine = async (engine: Engine) => {
  await loadBasic(engine);
  await loadInteractivityPlugin(engine);
  await loadExternalPushInteraction(engine);
};

interface ParticlesEngineProps {
  options: ISourceOptions;
}

export const ParticlesEngine = ({
  options,
}: ParticlesEngineProps) => (
  <ParticlesProvider init={registerEngine}>
    <Particles
      className="size-full"
      id="tsparticles"
      options={options}
    />
  </ParticlesProvider>
);
