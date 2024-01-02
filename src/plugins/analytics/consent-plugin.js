import PreferenceService from "@/services/PreferenceService";

const AnalyticsConsentPlugin = {
  install(Vue, options) {
    Vue.mixin({
      created() {
        this.checkConsent();
      },
      methods: {
        async checkConsent() {
          // Check for Do Not Track setting
          // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack
          const doNotTrackIsEnabled = navigator.doNotTrack === "1";
          const consentGiven = await PreferenceService.getAnalyticsConsent();

          if (!doNotTrackIsEnabled && consentGiven === "true") {
            options.onConsentGiven();
          }
        },
      },
    });
  },
};

export default AnalyticsConsentPlugin;
