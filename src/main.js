import Vue from "vue";
import VueMeta from "vue-meta";
import App from "./App.vue";
import router from "./router";
import AnalyticsPlugin from "./plugins/analytics/analytics-plugin";
import AnalyticsConsentPlugin from "./plugins/analytics/consent-plugin";

Vue.config.productionTip = false;

Vue.use(AnalyticsPlugin, {
  domain: process.env.VUE_APP_ANALYTICS_DOMAIN,
  trackLocalhost: false,
  router: router,
});

Vue.use(AnalyticsConsentPlugin, {
  onConsentGiven: () => {
    Vue.prototype.$initAnalytics();
  },
});

Vue.use(VueMeta);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
