export const AnalyticsConsentPlugin = {
  install(Vue, options) {
    Vue.mixin({
      created() {
        this.checkConsent();
      },
      methods: {
        checkConsent() {
          // Check for Do Not Track setting
          const doNotTrackIsEnabled = navigator.doNotTrack === "1";
          if (doNotTrackIsEnabled) {
            return;
          }

          const consentGiven = localStorage.getItem("analyticsConsent");
          if (consentGiven === null) {
            // Show consent prompt logic here
            // For simplicity, using a confirm dialog
            if (confirm("Can we collect analytics data during your visit?")) {
              localStorage.setItem("analyticsConsent", "true");
              options.onConsentGiven();
            } else {
              localStorage.setItem("analyticsConsent", "false");
            }
          } else if (consentGiven === "true") {
            options.onConsentGiven();
          }
        },
      },
    });
  },
};
