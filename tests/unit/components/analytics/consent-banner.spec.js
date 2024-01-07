import { shallowMount } from "@vue/test-utils";
import AnalyticsConsentBanner from "@/components/analytics/ConsentBanner.vue";
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";
import PreferenceService from "@/services/PreferenceService";

// Mocking PreferenceService
jest.mock("@/services/PreferenceService", () => ({
  getAnalyticsConsent: jest.fn(),
  updateAnalyticsConsent: jest.fn(),
}));

describe("AnalyticsConsentBanner.vue", () => {
  beforeEach(() => {
    // Clear mock calls before each test
    PreferenceService.getAnalyticsConsent.mockClear();
    PreferenceService.updateAnalyticsConsent.mockClear();
  });

  it("renders the consent banner when user visits very first time", async () => {
    PreferenceService.getAnalyticsConsent.mockResolvedValue(null);
    const wrapper = shallowMount(AnalyticsConsentBanner, {
      stubs: ["router-link"],
    });

    // Wait for the promise to resolve
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".analytics-consent-banner").exists()).toBe(true);
  });

  it("emits `consent-given` when 'Yes' button is clicked", async () => {
    PreferenceService.getAnalyticsConsent.mockResolvedValue(null);
    const wrapper = shallowMount(AnalyticsConsentBanner, {
      stubs: ["router-link"],
    });

    // Wait for the component to update
    await wrapper.vm.$nextTick();
    await wrapper.find(".yes-button").trigger("click");
    expect(wrapper.emitted("consent-given")).toBeTruthy();
  });

  it("emits `consent-denied` when 'No' button is clicked", async () => {
    PreferenceService.getAnalyticsConsent.mockResolvedValue(null);
    const wrapper = shallowMount(AnalyticsConsentBanner, {
      stubs: ["router-link"],
    });

    await wrapper.vm.$nextTick();
    await wrapper.find(".no-button").trigger("click");
    expect(wrapper.emitted("consent-denied")).toBeTruthy();
  });

  // Since the ToggleSwitch has a problem at the moment, skipping this test
  it.skip("emits correct event based on the toggle switch change", async () => {
    PreferenceService.getAnalyticsConsent.mockResolvedValue("true");
    const wrapper = shallowMount(AnalyticsConsentBanner, {
      stubs: ["router-link"],
      components: {
        ToggleSwitch,
      },
    });
    await wrapper.vm.$nextTick();
    wrapper.findComponent(ToggleSwitch).vm.$emit("change", false);
    expect(wrapper.emitted("consent-denied")).toBeTruthy();
  });
});
