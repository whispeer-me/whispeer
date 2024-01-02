<template>
  <footer class="app-footer">
    <AnalyticsConsentToggle @consent-given="handleConsentGiven" />
    <p class="footer-text">
      © 2024 Whispeer.me
      <router-link to="/privacy-policy" class="footer-link"
        >Privacy Policy</router-link
      >.
    </p>
  </footer>
</template>

<script>
import AnalyticsConsentToggle from "@/components/AnalyticsConsentToggle.vue";

export default {
  components: {
    AnalyticsConsentToggle,
  },
  methods: {
    handleConsentGiven() {},
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/app.scss";

.app-footer {
  background-color: rgba(0, 0, 0, 0.7);
  color: $primary-color;
  padding: 20px;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;

  .footer-text {
    margin-top: 10px;
  }

  .footer-link {
    color: $primary-color;
    &:hover {
      color: $hover-color;
    }
  }
}
</style>
