const AnalyticsConsentPlugin = {
  install(Vue, options) {
    Vue.mixin({
      created() {
        this.checkConsent();
      },
      methods: {
        checkConsent() {
          // Check for Do Not Track setting
          // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack
          const doNotTrackIsEnabled = navigator.doNotTrack === "1";
          const consentGiven = localStorage.getItem("analyticsConsent");

          if (!doNotTrackIsEnabled && consentGiven === "true") {
            options.onConsentGiven();
          }
        },
      },
    });
  },
};

export default AnalyticsConsentPlugin;
