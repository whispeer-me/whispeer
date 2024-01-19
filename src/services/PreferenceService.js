import * as Constants from "@/utils/constants";

export default {
  async updateAnalyticsConsent(consentGiven) {
    localStorage.setItem(Constants.ANALYTICS_CONSENT_KEY, consentGiven);
  },

  async getAnalyticsConsent() {
    return localStorage.getItem(Constants.ANALYTICS_CONSENT_KEY);
  },

  async shouldShowAnalyticsBanner() {
    return this.getAnalyticsConsent() === null;
  },

  async shouldTrackAnalytics() {
    return this.getAnalyticsConsent() === "true";
  },

  /**
   * Checks if a feature with the given key should be shown, based on:
   * - maxCount: The maximum number of times to show it
   * - randomChance: Whether to show randomly before reaching maxCount
   * - viewCount: Fetched from localStorage for the key
   *
   * Increments the viewCount if it is shown.
   * Returns a boolean indicating if it should be shown.
   */
  shouldShow(key, maxCount, randomChance = true) {
    let viewCount = this.getViewsCount(key);

    let shouldShow = false;

    // Show randomly if we haven't show them enough.
    if (viewCount < maxCount) {
      shouldShow = randomChance ? Math.random() < 0.5 : true;
      if (shouldShow) {
        this.incrementViewsCount(key);
      }
    }

    return shouldShow;
  },

  getViewsCount(key) {
    return localStorage.getItem(key) || 0;
  },

  setViewsCount(key, value) {
    localStorage.setItem(key, value);
  },

  incrementViewsCount(key) {
    let currentViewCount = this.getViewsCount(key);
    this.setViewsCount(key, ++currentViewCount);
  },
};
