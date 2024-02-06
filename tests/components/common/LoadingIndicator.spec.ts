// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import LoadingIndicator from "@/components/common/LoadingIndicator.vue";

const defaultLoadingText = "L o a d i n g . . .";

describe("LoadingIndicator.vue", () => {
  it("renders when isLoading is true", () => {
    const wrapper = mount(LoadingIndicator, {
      props: { isLoading: true },
    });
    expect(wrapper.text()).toBe(defaultLoadingText);
    expect(wrapper.find(".loading-indicator").exists()).toBe(true);
  });

  it("does not render when isLoading is false", () => {
    const wrapper = mount(LoadingIndicator, {
      props: { isLoading: false },
    });
    expect(wrapper.find(".loading-indicator").exists()).toBe(false);
  });

  it("renders custom text when provided and isLoading is true", () => {
    const customText = "Calling the API ...";
    const wrapper = mount(LoadingIndicator, {
      props: { isLoading: true, text: customText },
    });
    expect(wrapper.text()).toBe(customText);
    expect(wrapper.find(".loading-indicator").exists()).toBe(true);
  });
});
