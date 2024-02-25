// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Switch from "@/components/common/Switch.vue";

describe("Switch.vue", () => {
  it("renders with the correct initial value", () => {
    const wrapper = mount(Switch, {
      props: { value: true, title: "Toggle" },
    });
    const inputElement = wrapper.find('input[type="checkbox"]')
      .element as HTMLInputElement;
    expect(inputElement.checked).toBe(true);
  });

  it("emits change event with the new value when clicked", async () => {
    const wrapper = mount(Switch, {
      props: { value: false },
    });
    await wrapper.find('input[type="checkbox"]').setValue(true);
    const changeEvents = wrapper.emitted("change");
    expect(changeEvents).toBeDefined();
    expect(changeEvents![0]).toEqual([true]);
  });

  it("displays the correct title", () => {
    const titleText = "Custom Title";
    const wrapper = mount(Switch, {
      props: { title: titleText },
    });
    expect(wrapper.find("span").text()).toContain(titleText);
  });
});
