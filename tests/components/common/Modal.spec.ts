// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Modal from "@/components/common/Modal.vue";

describe("Modal.vue", () => {
  it("renders when isVisible is true", () => {
    const wrapper = mount(Modal, {
      props: { isVisible: true },
    });
    expect(wrapper.find(".modal-overlay").exists()).toBe(true);
  });

  it("does not render when isVisible is false", () => {
    const wrapper = mount(Modal, {
      props: { isVisible: false },
    });
    expect(wrapper.find(".modal-overlay").exists()).toBe(false);
  });
});
