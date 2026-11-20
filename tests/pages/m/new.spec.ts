// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import NewMessage from "@/pages/m/new.vue";
import messageService from "~/composables/message.service";

const PLAINTEXT = "meet me at the old bridge at noon";
const PAYLOAD_KEYS = [
  "burn_after_read",
  "content",
  "has_passphrase",
  "iv",
  "salt",
  "version",
];

describe("Creating NewMessage", () => {
  let wrapper: ReturnType<typeof mount>;
  let createSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createSpy = vi
      .spyOn(messageService, "createMessage")
      .mockResolvedValue({ id: "AbCdEfGhIj" });
    wrapper = mount(NewMessage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const submit = async () => {
    await wrapper.find("form").trigger("submit");
    await flushPromises();
  };

  it("renders without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("displays warning message when the textarea max limits reach", async () => {
    const textarea = wrapper.find("textarea");
    await textarea.setValue("0".repeat(256));
    expect(wrapper.find(".warning").exists()).toBe(true);
    expect(wrapper.find(".warning").text()).toBe("0 characters left.");
  });

  it("always encrypts: posts no plaintext and builds a link with a #key", async () => {
    await wrapper.find("textarea").setValue(PLAINTEXT);
    await submit();
    await vi.waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));

    const body = createSpy.mock.calls[0][0];
    expect(Object.keys(body).sort()).toEqual(PAYLOAD_KEYS);
    expect(JSON.stringify(body)).not.toContain(PLAINTEXT);
    expect(body.version).toBe(2);
    expect(body.has_passphrase).toBe(false);
    expect(body.burn_after_read).toBe(false);

    await vi.waitFor(() => expect(wrapper.find(".copyable-link").exists()).toBe(true));
    const link = wrapper.find(".copyable-link").text();
    expect(link).toMatch(
      new RegExp(`^${window.location.origin}/m/AbCdEfGhIj#[A-Za-z0-9_-]{43}$`),
    );
  });

  it("blocks a passphrase shorter than 8 characters", async () => {
    await wrapper.find("textarea").setValue(PLAINTEXT);
    await wrapper.find(".passphrase-toggle input").setValue(true);
    await wrapper.find(".new-message-passphrase-input").setValue("short");
    await submit();

    expect(createSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".error-message").text()).toMatch(/at least 8/);
  });

  it("sets has_passphrase with a valid passphrase", async () => {
    await wrapper.find("textarea").setValue(PLAINTEXT);
    await wrapper.find(".passphrase-toggle input").setValue(true);
    await wrapper.find(".new-message-passphrase-input").setValue("long enough");
    await submit();
    await vi.waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1), {
      timeout: 5000,
    });

    const body = createSpy.mock.calls[0][0];
    expect(body.has_passphrase).toBe(true);
    expect(JSON.stringify(body)).not.toContain("long enough");
  });

  it("burn toggle sets burn_after_read", async () => {
    await wrapper.find("textarea").setValue(PLAINTEXT);
    await wrapper.find(".burn-toggle input").setValue(true);
    await submit();
    await vi.waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));

    expect(createSpy.mock.calls[0][0].burn_after_read).toBe(true);
  });
});
