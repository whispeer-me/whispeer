<script setup lang="ts">
function redirectToCreateMessagePage() {
  navigateTo({ path: "/m/new", query: { ref: "cta" } });
}
</script>

<template>
  <div class="home">
    <h1>Your Secrets Stay Safe with Whispeer</h1>

    <p class="intro">
      Send messages that vanish after 24 hours. Powerful client-side encryption.
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
