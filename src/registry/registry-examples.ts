import type { Registry } from "shadcn/schema";

export const examples: Registry["items"] = [
  {
    files: [
      {
        path: "examples/AppleHelloEffectDemo.tsx",
        type: "registry:example",
      },
    ],
    name: "apple-hello-effect-demo",
    registryDependencies: ["@envindavsorg/apple-hello-effect"],
    type: "registry:example",
  },
  {
    files: [
      {
        path: "examples/ThemeSwitcherDemo.tsx",
        type: "registry:example",
      },
    ],
    name: "theme-switcher-demo",
    registryDependencies: ["@envindavsorg/theme-switcher"],
    type: "registry:example",
  },
  {
    files: [
      {
        path: "examples/FlipSentencesDemo.tsx",
        type: "registry:example",
      },
    ],
    name: "flip-sentences-demo",
    registryDependencies: ["@envindavsorg/flip-sentences"],
    type: "registry:example",
  },
];
