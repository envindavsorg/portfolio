import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  reporter: process.env.CI ? "github" : "list",
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:1408",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm preview",
    port: 1408,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
