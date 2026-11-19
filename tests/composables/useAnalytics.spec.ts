// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom
// Real composable (tests/setup.ts mocks it for page tests): nothing sent to
// Plausible may contain the message ID or the #key.
import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const { trackEventSpy, trackPageviewSpy } = vi.hoisted(() => ({
  trackEventSpy: vi.fn(),
  trackPageviewSpy: vi.fn(),
}));

mockNuxtImport("useTrackEvent", () => trackEventSpy);
mockNuxtImport("useTrackPageview", () => trackPageviewSpy);

const ID = "AbCdEfGhIj";
const KEY = "k3yK3yk3yK3yk3yK3yk3yK3yk3yK3yk3yK3yk3yK3yA";

const loadReal = async () =>
  (await vi.importActual<typeof import("~/composables/useAnalytics")>(
    "~/composables/useAnalytics",
  )).default;

const sent = () =>
  JSON.stringify([...trackEventSpy.mock.calls, ...trackPageviewSpy.mock.calls]);

describe("useAnalytics (real)", () => {
  afterEach(() => {
    trackEventSpy.mockReset();
    trackPageviewSpy.mockReset();
    window.history.replaceState(null, "", "/");
  });

  it("page views on /m/<id>#<key> send neither the ID nor the key", async () => {
    window.history.replaceState(null, "", `/m/${ID}#${KEY}`);
    const useAnalytics = await loadReal();

    useAnalytics().trackPageView({ useRef: false });
    useAnalytics().trackPageView({ referrer: `https://whispeer.test/m/${ID}#${KEY}` });

    expect(trackPageviewSpy).toHaveBeenCalledTimes(2);
    expect(trackPageviewSpy.mock.calls[0][0].url).toBe(`${window.location.origin}/m/`);
    expect(sent()).not.toContain(ID);
    expect(sent()).not.toContain(KEY);
  });

  it("clean events on /m/<id>#<key> send neither the ID nor the key", async () => {
    window.history.replaceState(null, "", `/m/${ID}#${KEY}`);
    const useAnalytics = await loadReal();

    useAnalytics().trackEventClean("message-viewed", {
      props: { has_passphrase: false, burn_after_read: true },
    });

    expect(trackEventSpy).toHaveBeenCalledTimes(1);
    const [name, data, options] = trackEventSpy.mock.calls[0];
    expect(name).toBe("message-viewed");
    expect(data.url).toBe(`${window.location.origin}/m/`);
    expect(options.url).toBe(`${window.location.origin}/m/`);
    expect(data.referrer).toBeNull();
    expect(sent()).not.toContain(ID);
    expect(sent()).not.toContain(KEY);
  });
});
