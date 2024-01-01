import Plausible from "plausible-tracker";

// This is a mock analytics plugin that does nothing
// to respect user's privacy
// Instead of checking on each page and event; having an empty mock is better
const mockAnalytics = {
  trackEvent: () => {}, // Empty function, does nothing
  trackPageview: () => {}, // Similarly, an empty function
};

const AnalyticsPlugin = {
  install(Vue, options) {
    // Check for Do Not Track setting
    const doNotTrackeIsEnabled = navigator.doNotTrack === "1";
    const analytics = doNotTrackeIsEnabled ? mockAnalytics : Plausible(options);

    Vue.prototype.$analytics = analytics;

    if (options.router && !doNotTrackeIsEnabled) {
      options.router.afterEach((to) => {
        analytics.trackPageview({ path: to.fullPath });
      });
    }
  },
};

export default AnalyticsPlugin;
