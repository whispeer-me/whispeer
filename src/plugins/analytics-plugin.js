import Plausible from "plausible-tracker";

const AnalyticsPlugin = {
  install(Vue, options) {
    const plausible = Plausible(options);

    Vue.prototype.$analytics = plausible;

    if (options.router) {
      options.router.afterEach((to) => {
        plausible.trackPageview({ path: to.fullPath });
      });
    }
  },
};

export default AnalyticsPlugin;
