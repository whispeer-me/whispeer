import { vi } from "vitest";
import type { PlausibleOptions, EventOptions } from "plausible-tracker";

// Mocking Nuxt's useNuxtApp to include $plausible
// with detailed mock implementations
vi.mock("#app", () => ({
  useNuxtApp: vi.fn(() => ({
    config: {},
    defineNuxtConfig: vi.fn(() => {}),
    $plausible: {
      isEnabled: false,
      trackLocalhost: false,
      autoPageviews: false,
      autoOutboundTracking: true,
      trackPageview: vi.fn(
        (_eventData?: PlausibleOptions, _options?: EventOptions) => {}
      ),
      trackEvent: vi.fn(
        (
          _eventName: string,
          _options?: EventOptions,
          _eventData?: PlausibleOptions
        ) => {}
      ),
    },
  })),
}));

// Mocking Plausible functionality with parameters
vi.mock("@nuxtjs/plausible", () => ({
  useTrackPageview: vi.fn(
    (eventData?: PlausibleOptions, options?: EventOptions) => {}
  ),
  useTrackEvent: vi.fn(
    (
      _eventName: string,
      _options?: EventOptions,
      _eventData?: PlausibleOptions
    ) => {}
  ),
}));

// Mock for useHead
vi.mock("@unhead/vue");
vi.mocked(useHead).mockImplementation(vi.fn());
