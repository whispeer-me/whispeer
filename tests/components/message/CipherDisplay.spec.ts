// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import CipherDisplay from "@/components/message/CipherDisplay.vue";

describe("CipherDisplay", () => {
  it("keeps emoji, flags and ZWJ sequences whole (issue #17)", async () => {
    vi.useFakeTimers();
    const message = "Hi 👋 🇹🇷 👩‍💻 ü";
    const wrapper = mount(CipherDisplay, { props: { message } });

    vi.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();

    const matched = wrapper.findAll(".char.matched").map(s => s.text() || " ");
    expect(matched).toEqual(["H", "i", " ", "👋", " ", "🇹🇷", " ", "👩‍💻", " ", "ü"]);
    vi.useRealTimers();
  });
});
