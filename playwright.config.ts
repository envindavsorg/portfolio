import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Permet de pointer un Chromium déjà installé (images CI qui embarquent
        // les navigateurs, ou version de build différente de celle qu'attend
        // @playwright/test). Sans la variable, Playwright résout comme d'habitude.
        ...(process.env.PLAYWRIGHT_CHROMIUM_PATH && {
          launchOptions: {
            executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
          },
        }),
      },
    },
  ],
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : "list",
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:1408",
    trace: "on-first-retry",
  },
  webServer: {
    // `pnpm preview` construit puis sert : c'est ce qu'on veut en local, où le
    // build peut être périmé. La CI construit déjà dans une étape dédiée (pour
    // obtenir une erreur lisible si c'est la compilation qui casse) et passe
    // donc une commande qui se contente de servir.
    command: process.env.PLAYWRIGHT_WEB_SERVER ?? "pnpm preview",
    port: 1408,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
