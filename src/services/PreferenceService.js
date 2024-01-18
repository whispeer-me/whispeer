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

  shouldShowTooltip(key) {
    let views = this.getToolTipViews(key) || 0;

    let shouldShow = false;

    // Show randomly if we haven't show them enough.
    if (views < Constants.TOOLTIP_SHOW_TIME) {
      shouldShow = Math.random() < 0.5;
      if (shouldShow) {
        this.incrementToolTipViews(key);
      }
    }

    return shouldShow;
  },

  getToolTipViews(key) {
    return localStorage.getItem(key);
  },

  setTooltipViews(key, value) {
    localStorage.setItem(key, value);
  },

  incrementToolTipViews(key) {
    let newCount = 0;
    const currentViews = this.getToolTipViews(key);
    if (currentViews) {
      newCount = parseInt(currentViews);
    }

    this.setTooltipViews(key, ++newCount);
  },
};
