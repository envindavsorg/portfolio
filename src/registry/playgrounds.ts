import type { ComponentType } from "react";
import { lazy } from "react";

import type { PlaygroundControl } from "@/lib/playground";
import { m } from "@/paraglide/messages";

/**
 * Props réglables des composants du registre.
 *
 * Déclarées ici et non dans `lib/playground.ts` : le libellé passe par les
 * messages Paraglide, que la bibliothèque pure n'importe pas. La clé est le nom
 * du composant dans le registre — pas celui de sa démo.
 *
 * Le composant est référencé ici, et non lu dans `Index` : les entrées
 * `registry:component` du registre généré ne portent PAS de champ `component`,
 * seules les entrées `registry:example` en ont un. Passer par `Index` rendait
 * donc le bac à sable vide en silence.
 *
 * Un composant absent de cette table n'affiche simplement pas d'onglet « bac à
 * sable ». `theme-switcher` ne prend aucune prop : il n'y a rien à régler.
 */
export interface DeclaredControl extends PlaygroundControl {
  label: () => string;
}

/**
 * Les props sont construites à l'exécution depuis les contrôles : aucune
 * signature statique ne les décrit, d'où l'index ouvert. C'est le seul endroit
 * du bac à sable où le typage doit lâcher, et il est confiné ici.
 */
export type PlaygroundComponent = ComponentType<
  Record<string, unknown>
>;

export interface PlaygroundDefinition {
  /** nom du composant en PascalCase, tel qu'on l'écrit dans du JSX */
  displayName: string;
  component: PlaygroundComponent;
  controls: DeclaredControl[];
}

export const PLAYGROUNDS: Record<string, PlaygroundDefinition> = {
  "apple-hello-effect": {
    component: lazy(async () => {
      const mod = await import(
        "@/registry/apple-hello-effect/AppleHelloEffect"
      );
      return { default: mod.AppleHelloEffect };
    }) as unknown as PlaygroundComponent,
    controls: [
      {
        defaultValue: 1,
        kind: "number",
        label: m.writings_playground_label_speed,
        max: 3,
        min: 0.2,
        prop: "speed",
        step: 0.1,
      },
      {
        defaultValue: "h-20",
        kind: "text",
        label: m.writings_playground_label_class_name,
        prop: "className",
      },
    ],
    displayName: "AppleHelloEffect",
  },
  "flip-sentences": {
    component: lazy(async () => {
      const mod = await import(
        "@/registry/flip-sentences/FlipSentences"
      );
      return { default: mod.FlipSentences };
    }) as unknown as PlaygroundComponent,
    controls: [
      {
        defaultValue: [
          "développeur front-end",
          "amateur de détails",
          "curieux de tout",
        ],
        kind: "lines",
        label: m.writings_playground_label_sentences,
        prop: "sentences",
      },
      {
        defaultValue: 3000,
        kind: "number",
        label: m.writings_playground_label_interval,
        max: 10_000,
        min: 300,
        prop: "interval",
        step: 100,
      },
      {
        defaultValue: false,
        kind: "boolean",
        label: m.writings_playground_label_disable_animation,
        prop: "disableAnimation",
      },
    ],
    displayName: "FlipSentences",
  },
};
