import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Use jsdom for testing React components
    globals: true,  // Enable global variables like `describe`, `it`, etc.
    setupFiles: ["./vitest.setup.ts"],  // Path to setup file for test environment configuration
    pool: "threads",  // Use threads for test execution
    exclude: [  //
      "**/node_modules/**",
      "**/.next/**",
      "**/tests/**",
      "**/*.spec.ts",
    ],
  },
  resolve: {  // Set up path alias for cleaner imports
    alias: { "@": path.resolve(__dirname, "./") },
  },
});