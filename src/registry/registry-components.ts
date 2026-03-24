import type { Registry } from "shadcn/schema";

export const components: Registry["items"] = [
  {
    author: "envindavsorg <contact@cuzeacflorin.fr>",
    dependencies: ["next-themes", "@phosphor-icons/react", "motion"],
    description:
      "Un composant de sélection de thème pour les applications Next.js avec next-themes et Tailwind CSS, supportant les modes système, clair et sombre.",
    docs: "https://cuzeacflorin.fr/components/theme-switcher-component",
    files: [
      {
        path: "theme-switcher/ThemeSwitcher.tsx",
        type: "registry:component",
      },
    ],
    name: "theme-switcher",
    registryDependencies: ["@envindavsorg/utils"],
    title: "Theme Switcher",
    type: "registry:component",
  },
  {
    author: "envindavsorg <contact@cuzeacflorin.fr>",
    dependencies: ["motion"],
    description:
      "Créez un effet d'écriture Bonjour, Hello et Hola inspiré d'Apple en utilisant motion/react.",
    docs: "https://cuzeacflorin.fr/components/writing-effect-inspired-by-apple",
    files: [
      {
        path: "apple-hello-effect/AppleHelloEffect.tsx",
        type: "registry:component",
      },
    ],
    name: "apple-hello-effect",
    registryDependencies: ["@envindavsorg/utils"],
    title: "Apple Hello Effect",
    type: "registry:component",
  },
  {
    author: "envindavsorg <contact@cuzeacflorin.fr>",
    dependencies: ["motion"],
    description:
      "Un composant React animé avec motion/react qui fait défiler automatiquement une liste de phrases avec une transition fluide.",
    docs: "https://cuzeacflorin.fr/components/flip-sentences",
    files: [
      {
        path: "flip-sentences/FlipSentences.tsx",
        type: "registry:component",
      },
    ],
    name: "flip-sentences",
    registryDependencies: ["@envindavsorg/utils"],
    title: "Flip Sentences",
    type: "registry:component",
  },
];
