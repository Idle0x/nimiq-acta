import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "forks",
    // One file at a time: DB suites share one database (truncate between
    // suites), so file-level parallelism would corrupt them.
    maxWorkers: 1,
    sequence: { shuffle: false },
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
