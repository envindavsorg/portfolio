import { type CheckOptions, defineConfig } from "taze";

const config: Partial<CheckOptions> = defineConfig({
  exclude: ["fumadocs-core", "next"],
  force: true,
  write: true,
  install: false,
  ignoreOtherWorkspaces: true,
  ignorePaths: ["**/node_modules/**", "**/test/**"],
  packageMode: {
    typescript: "major",
  },
  depFields: {
    overrides: false,
  },
});

export default config;
