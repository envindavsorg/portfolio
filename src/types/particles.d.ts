import type { ISourceOptions } from "@tsparticles/engine";
import type ParticlesReact from "@tsparticles/react";

declare global {
  type ParticlesComponentType = typeof ParticlesReact;

  interface ParticlesConfig {
    density?: number;
    minSize?: number;
    maxSize?: number;
    speed?: number;
    color?: string;
    background?: string;
  }

  type ParticlesOptions = ISourceOptions;
}
