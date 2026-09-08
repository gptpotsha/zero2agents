import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  // Тесты ходят на уже запущенный dev-сервер (3000).
  // Отдельный webServer поднимается только если 3000 недоступен.
  webServer: process.env.CI
    ? {
        command: "npm run dev",
        url: "http://localhost:3000",
        timeout: 90_000,
        stdout: "ignore",
      }
    : undefined,
});
