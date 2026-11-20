// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ViewMessage from "@/pages/m/[id].vue";
import messageService from "~/composables/message.service";
import CryptoService from "~/composables/crypto.service";

const ID = "AbCdEfGhIj";
const PLAINTEXT = "the eagle lands at dawn";

mockNuxtImport("useRuntimeConfig", () => () => ({
  public: { domain: "whispeer.test" },
}));

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  // Minimal route (no hash: the page reads it from location). The real-router
  // behaviour is covered in view.router.spec.ts.
  return {
    ...actual,
    useRoute: () => ({ params: { id: "AbCdEfGhIj" }, path: "/m/AbCdEfGhIj", query: {}, hash: "" }),
    useRouter: () => ({ replace: async () => {} }),
  };
});

const openAt = (hash: string) => {
  window.history.replaceState(null, "", `/m/${ID}${hash}`);
};

const normalResponse = (payload: Record<string, unknown>) => ({
  status: 200,
  data: { id: ID, ...payload, view_count: 0, expires_in: "23 hours" },
});

describe("Viewing a message", () => {
  let decryptSpy: ReturnType<typeof vi.spyOn>;
  let getSpy: ReturnType<typeof vi.spyOn>;
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    decryptSpy = vi.spyOn(CryptoService, "decrypt");
    getSpy = vi.spyOn(messageService, "getMessage");
    openSpy = vi.spyOn(messageService, "openMessage");
    vi.spyOn(messageService, "increaseViewCount").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    openAt("");
  });

  const lastDecrypt = async () =>
    await decryptSpy.mock.results[decryptSpy.mock.results.length - 1].value;

  it("decrypts with the key from the hash and strips the hash via replaceState", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(PLAINTEXT, {
      burnAfterRead: false,
    });
    getSpy.mockResolvedValue(normalResponse(payload));
    openAt(`#${linkKey}`);
    const replaceSpy = vi.spyOn(window.history, "replaceState");

    mount(ViewMessage);
    await vi.waitFor(() => expect(decryptSpy).toHaveBeenCalled());

    expect(await lastDecrypt()).toBe(PLAINTEXT);
    expect(decryptSpy.mock.calls[0][1]).toBe(linkKey);
    expect(replaceSpy).toHaveBeenCalled();
    const url = String(replaceSpy.mock.calls[0][2]);
    expect(url).not.toContain("#");
    expect(url).not.toContain(linkKey);
    expect(window.location.hash).toBe("");
  });

  it("shows a link incomplete error without a hash and never decrypts", async () => {
    openAt("");
    const wrapper = mount(ViewMessage);
    await flushPromises();

    expect(wrapper.text()).toMatch(/incomplete/i);
    expect(decryptSpy).not.toHaveBeenCalled();
    expect(getSpy).not.toHaveBeenCalled();
  });

  it("burn message shows Open and only calls /open on click", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(PLAINTEXT, {
      burnAfterRead: true,
    });
    getSpy.mockResolvedValue({
      status: 200,
      data: {
        id: ID,
        version: 2,
        has_passphrase: false,
        burn_after_read: true,
        expires_in: "23 hours",
      },
    });
    openSpy.mockResolvedValue({ status: 200, data: { ...payload } });
    openAt(`#${linkKey}`);

    const wrapper = mount(ViewMessage);
    await vi.waitFor(() => expect(wrapper.find(".open-burn-message").exists()).toBe(true));

    expect(wrapper.text()).toMatch(/deleted after you open it/i);
    expect(openSpy).not.toHaveBeenCalled();
    expect(decryptSpy).not.toHaveBeenCalled();

    await wrapper.find(".open-burn-message").trigger("click");
    await vi.waitFor(() => expect(decryptSpy).toHaveBeenCalled());

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(ID);
    expect(await lastDecrypt()).toBe(PLAINTEXT);
  });

  it("wrong passphrase can be retried without a second fetch", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(PLAINTEXT, {
      passphrase: "correct horse",
      burnAfterRead: false,
    });
    getSpy.mockResolvedValue(normalResponse(payload));
    openAt(`#${linkKey}`);

    const wrapper = mount(ViewMessage);
    await vi.waitFor(() => expect(wrapper.find(".passphrase-input").exists()).toBe(true));
    expect(decryptSpy).not.toHaveBeenCalled();

    await wrapper.find(".passphrase-input").setValue("wrong guess");
    await wrapper.find(".passphrase-modal form").trigger("submit");
    await vi.waitFor(() => expect(wrapper.text()).toMatch(/passphrase/i), {
      timeout: 5000,
    });
    await vi.waitFor(
      () => expect(wrapper.find(".passphrase-modal .error-message").exists()).toBe(true),
      { timeout: 5000 },
    );

    await wrapper.find(".passphrase-input").setValue("correct horse");
    await wrapper.find(".passphrase-modal form").trigger("submit");
    await vi.waitFor(() => expect(decryptSpy).toHaveBeenCalledTimes(2), {
      timeout: 5000,
    });

    expect(await lastDecrypt()).toBe(PLAINTEXT);
    expect(getSpy).toHaveBeenCalledTimes(1);
  }, 15000);
});
