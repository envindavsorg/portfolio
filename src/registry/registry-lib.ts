import type { Registry } from "shadcn/schema";

export const lib: Registry["items"] = [
  {
    author: "envindavsorg <contact@cuzeacflorin.fr>",
    dependencies: ["clsx", "tailwind-merge"],
    files: [
      {
        path: "src/lib/utils.ts",
        type: "registry:lib",
      },
    ],
    name: "utils",
    title: "Fonctions utilitaires",
    type: "registry:lib",
  },
];
