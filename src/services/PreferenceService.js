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
};
