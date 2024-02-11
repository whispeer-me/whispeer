<script setup lang="ts">
function redirectToCreateMessagePage() {
  navigateTo({ path: "/m/new", query: { ref: "cta" } });
}
</script>

<template>
  <div class="home">
    <h1>Welcome to Whispeer</h1>

    <p class="intro">
      Create and share secure, encrypted messages that auto-expire in 24 hours.
    </p>

    <button class="cta-button" @click="redirectToCreateMessagePage">
      Create a secure message
    </button>

    <MessageStats />
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/scss/home.scss";
</style>
