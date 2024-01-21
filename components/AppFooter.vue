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
      >
    </p>
  </footer>
</template>

<script setup>
function initAnalytics() {
  this.$initAnalytics();
}

function stopAnalytics() {
  this.$stopAnalytics();
}
</script>

<style lang="scss">
@import url("~/assets/scss/footer.scss");
</style>
