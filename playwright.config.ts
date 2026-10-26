import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:18993",
    headless: true,
    channel: "chrome",
    viewport: { width: 1440, height: 1100 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next start --port 18993",
    url: "http://localhost:18993",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
