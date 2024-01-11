<template>
  <footer class="app-footer">
    <AnalyticsConsentBanner
      @consent-given="initAnalytics"
      @consent-denied="stopAnalytics"
    />
    <p class="footer-text">
      © 2024 Whispeer.me
      <router-link to="/privacy-policy" class="footer-link"
        >Privacy Policy</router-link
      >.
    </p>
  </footer>
</template>

<script>
import AnalyticsConsentBanner from "@/components/analytics/ConsentBanner.vue";

import Vue from "vue";
export default Vue.extend({
  name: "AppFooter",
  components: {
    AnalyticsConsentBanner,
  },
  methods: {
    initAnalytics() {
      this.$initAnalytics();
    },
    stopAnalytics() {
      this.$stopAnalytics();
    },
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/app.scss";

.app-footer {
  background-color: rgba(0, 0, 0, 0.7);
  color: $primary-color;
  padding: 10px;
  text-align: center;
  bottom: 0;
  width: 100%;

  .footer-text {
    margin: 10px;
  }

  .footer-link {
    color: $primary-color;
    &:hover {
      color: $hover-color;
    }
  }
}
</style>
