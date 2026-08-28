import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../vitest.config.base.js";

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: ["./test/fixtures/setup.ts"],
    },
  }),
);
