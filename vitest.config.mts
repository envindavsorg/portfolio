import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // `node` par défaut : aucun des 32 fichiers de test ne touche au DOM, et
    // Vitest 5 a mesuré ce que coûtait `jsdom` partout — 32 environnements
    // créés, 51 % du temps de la suite. Un test de composant demande le DOM
    // lui-même, en tête de fichier : `// @vitest-environment jsdom`.
    environment: "node",
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
