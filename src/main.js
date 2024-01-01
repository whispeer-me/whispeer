import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import AnalyticsPlugin from "./plugins/analytics-plugin";

Vue.config.productionTip = false;

Vue.use(AnalyticsPlugin, {
  domain: process.env.VUE_APP_ANALYTICS_DOMAIN,
  trackLocalhost: false,
  router: router,
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
