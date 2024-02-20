import { defineVitestConfig } from "@nuxt/test-utils/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineVitestConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
  },
  plugins: [tsconfigPaths()],
});
