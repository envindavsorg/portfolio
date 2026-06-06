import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react, next],
  ignorePatterns: [...(core.ignorePatterns ?? []), "next-env.d.ts"],
  rules: {
    "eslint/require-await": "off",
    // crash oxlint 1.68 (worker OOM) sur le graphe de re-exports (fr)/en
    "import/no-cycle": "off",
    "jsx-a11y/heading-has-content": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "react/display-name": "off",
    "react/no-danger": "off",
    "react/no-unescaped-entities": "off",
    "unicorn/filename-case": "off",
  },
});
