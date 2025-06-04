// SPDX-License-Identifier: AGPL-3.0-only

import { defineVitestConfig } from "@nuxt/test-utils/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineVitestConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.spec.ts"],
  },
  plugins: [tsconfigPaths()],
});
