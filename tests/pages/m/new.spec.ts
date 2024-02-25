// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import NewMessage from "@/pages/m/new.vue";

describe("Creating NewMessage", () => {
  const wrapper = mount(NewMessage);

  it("renders without crashing", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("displays warning message when the textarea max limits reach", async () => {
    const textarea = wrapper.find("textarea");
    await textarea.setValue("0".repeat(256));
    expect(wrapper.find(".warning").exists()).toBe(true);
    expect(wrapper.find(".warning").text()).toBe("0 characters left.");
  });
});
