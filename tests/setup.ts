// SPDX-License-Identifier: AGPL-3.0-only

import { vi } from "vitest";

// Mock for useHead
vi.mock("@unhead/vue");
vi.mocked(useHead).mockImplementation(vi.fn());

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
