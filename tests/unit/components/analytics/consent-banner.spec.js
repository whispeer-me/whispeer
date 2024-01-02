import { shallowMount } from "@vue/test-utils";
import AnalyticsConsentBanner from "@/components/analytics/ConsentBanner.vue";

// Mocking localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      if  (value == null) {
        delete store[key];
        return;
      }
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe("AnalyticsConsentBanner.vue", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();
  });

  it("renders when `show` is true", () => {
    // Set initial state for the component
    mockLocalStorage.setItem("analyticsConsent", null);

    const wrapper = shallowMount(AnalyticsConsentBanner, {
      stubs: ['router-link'],
    });

    // Check if the banner is visible
    expect(wrapper.vm.show).toBe(true);
    expect(wrapper.find(".analytics-consent-banner").exists()).toBe(true);
  });

  it("does not render when `analyticsConsent` is set in localStorage", () => {
    mockLocalStorage.setItem("analyticsConsent", "true");

    const wrapper = shallowMount(AnalyticsConsentBanner, {
      stubs: ['router-link'],
    });

    expect(wrapper.vm.show).toBe(false);
    expect(wrapper.find(".analytics-consent-banner").exists()).toBe(false);
  });

  it("emits `consent-given` when 'Yes' button is clicked", async () => {
    mockLocalStorage.setItem("analyticsConsent", null);
    const wrapper = shallowMount(AnalyticsConsentBanner, {
      stubs: ['router-link'],
    });

    await wrapper.find(".yes-button").trigger("click");
    expect(wrapper.emitted("consent-given")).toBeTruthy();
    expect(mockLocalStorage.getItem("analyticsConsent")).toBe("true");
  });

  it("sets `analyticsConsent` to false in localStorage when 'No' button is clicked", async () => {
    mockLocalStorage.setItem("analyticsConsent", null);
    const wrapper = shallowMount(AnalyticsConsentBanner, {
      stubs: ['router-link'],
    });

    await wrapper.find(".no-button").trigger("click");
    expect(wrapper.emitted("consent-given")).toBeFalsy();
    expect(mockLocalStorage.getItem("analyticsConsent")).toBe("false");
  });
});
