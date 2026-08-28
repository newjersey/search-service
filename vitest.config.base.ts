import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
      thresholds: {
        statements: 75,
        branches: 75,
        functions: 75,
        lines: 75,
      }
    }
  },
});
