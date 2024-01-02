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
    // To prevent crashes in case user won't be "tracked"
    Vue.prototype.$analytics = mockAnalytics;

    Vue.prototype.$initAnalytics = () => {
      const analyticsPlatform = Plausible(options);
      Vue.prototype.$analytics = analyticsPlatform;

      if (options.router) {
        options.router.afterEach((to) => {
          analyticsPlatform.trackPageview({ path: to.fullPath });
        });
      }
    };
  },
};

export default AnalyticsPlugin;
