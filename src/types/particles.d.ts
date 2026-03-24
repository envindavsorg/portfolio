import type { ISourceOptions } from "@tsparticles/engine";

declare global {
  type ParticlesComponentType =
    typeof import("@tsparticles/react").default;

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
