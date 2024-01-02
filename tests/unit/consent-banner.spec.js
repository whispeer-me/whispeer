import { shallowMount } from "@vue/test-utils";
import AnalyticsConsentBanner from "@/components/analytics/ConsentBanner.vue";

describe("ConsentBanner.vue", () => {
  it("renders when `show:true` passed", () => {
    const show = true
    const wrapper = shallowMount(AnalyticsConsentBanner, {
      propsData: { show },
      stubs: ['router-link'],
    });
    expect(wrapper.find(".analytics-consent-banner").exists()).toBe(true);
  });
});
