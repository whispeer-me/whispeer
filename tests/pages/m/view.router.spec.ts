// SPDX-License-Identifier: AGPL-3.0-only
/* eslint-disable vue/one-component-per-file */

// @vitest-environment happy-dom
// Real vue-router + real history (no useRoute mock): the link key must leave
// the address bar, history.state and the router state, and stay out after
// in-app navigation.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { createRouter, createWebHistory, RouterView, type Router } from "vue-router";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ViewMessage from "@/pages/m/[id].vue";
import messageService from "~/composables/message.service";
import CryptoService from "~/composables/crypto.service";

const ID = "AbCdEfGhIj";
const PLAINTEXT = "the eagle lands at dawn";

mockNuxtImport("useRuntimeConfig", () => () => ({
  public: { domain: "whispeer.test" },
}));

const Home = defineComponent({ render: () => h("div", { class: "home" }, "home") });

const App = defineComponent({ render: () => h(RouterView) });

const leaks = (key: string) => {
  const where: string[] = [];
  if (window.location.href.includes(key)) { where.push("location"); }
  if (JSON.stringify(window.history.state ?? null).includes(key)) { where.push("history.state"); }
  return where;
};

describe("Viewing a message with a real router", () => {
  let router: Router;
  let wrapper: VueWrapper | undefined;
  let decryptSpy: ReturnType<typeof vi.spyOn>;
  let getSpy: ReturnType<typeof vi.spyOn>;
  let openSpy: ReturnType<typeof vi.spyOn>;

  const start = async (url: string) => {
    window.history.replaceState(null, "", url);
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/", component: Home },
        { path: "/m/:id", component: ViewMessage },
      ],
    });
    router.push(url);
    await router.isReady();
    wrapper = mount(App, { global: { plugins: [router] } });
    await flushPromises();
  };

  beforeEach(() => {
    decryptSpy = vi.spyOn(CryptoService, "decrypt");
    getSpy = vi.spyOn(messageService, "getMessage");
    openSpy = vi.spyOn(messageService, "openMessage");
    vi.spyOn(messageService, "increaseViewCount").mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  const normal = async (opts: { passphrase?: string } = {}) => {
    const { linkKey, payload } = await CryptoService.encrypt(PLAINTEXT, {
      ...opts,
      burnAfterRead: false,
    });
    getSpy.mockResolvedValue({
      status: 200,
      data: { id: ID, ...payload, view_count: 0, expires_in: "23 hours" },
    });
    return linkKey;
  };

  it("removes the key from history.state and router state, also after router.push", async () => {
    const linkKey = await normal();
    await start(`/m/${ID}#${linkKey}`);
    await vi.waitFor(() => expect(decryptSpy).toHaveBeenCalled());
    expect(await decryptSpy.mock.results[0].value).toBe(PLAINTEXT);

    expect(leaks(linkKey)).toEqual([]);
    expect(window.location.hash).toBe("");
    expect(router.currentRoute.value.fullPath).not.toContain(linkKey);
    expect(router.currentRoute.value.hash).toBe("");

    await router.push("/");
    await flushPromises();
    expect(leaks(linkKey)).toEqual([]);
    expect(window.location.hash).toBe("");
  });

  it("re-opening the original link in the same tab loads it and strips the key again", async () => {
    const linkKey = await normal();
    await start(`/m/${ID}`);
    expect(wrapper!.text()).toMatch(/incomplete/i);
    expect(getSpy).not.toHaveBeenCalled();

    // Same-document fragment navigation (no reload, no remount).
    window.location.hash = `#${linkKey}`;
    await vi.waitFor(() => expect(decryptSpy).toHaveBeenCalled());
    expect(await decryptSpy.mock.results[0].value).toBe(PLAINTEXT);
    await flushPromises();

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(wrapper!.text()).not.toMatch(/incomplete/i);
    expect(leaks(linkKey)).toEqual([]);
    expect(router.currentRoute.value.fullPath).not.toContain(linkKey);
  });

  it("damaged key on a burn message: no fetch, no Open button, clear error", async () => {
    const { linkKey } = await CryptoService.encrypt(PLAINTEXT, { burnAfterRead: true });
    getSpy.mockResolvedValue({
      status: 200,
      data: { id: ID, version: 2, has_passphrase: false, burn_after_read: true, expires_in: "1 hour" },
    });
    await start(`/m/${ID}#${linkKey.slice(0, 40)}`);

    expect(wrapper!.text()).toMatch(/damaged|incomplete/i);
    expect(wrapper!.find(".open-burn-message").exists()).toBe(false);
    expect(getSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("no 'Enter passphrase' button for a message without a passphrase that fails to decrypt", async () => {
    const linkKey = await normal();
    // Valid shape, wrong key.
    const other = (await CryptoService.encrypt("x", { burnAfterRead: false })).linkKey;
    await start(`/m/${ID}#${other}`);
    await vi.waitFor(() => expect(wrapper!.text()).toMatch(/can not be decrypted/i));

    expect(linkKey).not.toBe(other);
    expect(wrapper!.find(".enter-passphrase").exists()).toBe(false);
  });

  it("viewer passphrase field disables autocomplete", async () => {
    const linkKey = await normal({ passphrase: "correct horse" });
    await start(`/m/${ID}#${linkKey}`);
    await vi.waitFor(() => expect(wrapper!.find(".passphrase-input").exists()).toBe(true));

    expect(wrapper!.find(".passphrase-input").attributes("autocomplete")).toBe("off");
    // Modal open: the fallback button is hidden; it only shows for passphrase messages.
    expect(wrapper!.find(".enter-passphrase").exists()).toBe(false);
  });
});
