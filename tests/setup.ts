// SPDX-License-Identifier: AGPL-3.0-only

import { vi } from "vitest";
import { useHead } from "#imports";

// Mock for useHead
vi.mock("@unhead/vue", () => ({
  useHead: vi.fn(),
}));

// Mock for Analytics
vi.mock("~/composables/useAnalytics.ts", async (importOriginal) => {
  const actual = await importOriginal();
  return Object.assign({}, actual, {
    default: () => ({
      trackEvent: vi.fn(),
      trackPageView: vi.fn(),
    }),
  });
});
