// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CommonError from "@/components/common/Error.vue";

describe("Error.vue", () => {
  it("renders no error message when errorMessage is null", () => {
    const wrapper = mount(CommonError, {
      props: { errorMessage: null },
    });
    expect(wrapper.text()).toBe("");
  });

  it("displays the error message when provided", () => {
    const testMessage = "Test error message";
    const wrapper = mount(CommonError, {
      props: { errorMessage: testMessage },
    });
    expect(wrapper.text()).toBe(testMessage);
  });
});
