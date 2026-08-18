import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3101";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 7_000
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: [
    {
      command: "node tests/mocks/mock-api-server.cjs",
      url: "http://127.0.0.1:4010/health",
      reuseExistingServer: false,
      timeout: 120_000
    },
    {
      command: "npm run build && npm run start",
      url: baseURL,
      env: {
        ...process.env,
        API_BASE_URL: "http://127.0.0.1:4010",
        SESSION_SECRET: process.env.SESSION_SECRET || "e2e-session-secret",
        PORT: "3101"
      },
      reuseExistingServer: false,
      timeout: 120_000
    }
  ]
});
