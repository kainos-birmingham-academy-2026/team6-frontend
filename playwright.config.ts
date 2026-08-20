import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3001";
const useMockApi = !process.env.PLAYWRIGHT_BACKEND_API_BASE_URL;
const backendApiBaseUrl = process.env.PLAYWRIGHT_BACKEND_API_BASE_URL || "http://127.0.0.1:4010";
const serverUrl = new URL(baseURL);
const healthUrl = `${serverUrl.origin}/health`;
const appPort = serverUrl.port || "3001";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 7_000
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Keep one worker for stable session-dependent test flows.
  workers: 1,
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
      command: "npm run build && npm run start",
      url: healthUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: appPort,
        API_BASE_URL: backendApiBaseUrl
      }
    },
    ...(useMockApi
      ? [
          {
            command: "node tests/mocks/mock-api-server.cjs",
            url: `${backendApiBaseUrl}/health`,
            reuseExistingServer: !process.env.CI,
            timeout: 60_000
          }
        ]
      : [])
  ]
});
