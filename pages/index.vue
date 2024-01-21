<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

const createdCount = ref(0);
const expiringSoonCount = ref(0);
const viewCount = ref(0);
const ctaButtonTitle = ref("Create a secure message");

async function fetchData() {
  try {
    const { created_count, expiring_soon_count, view_count } = (
      await messageService.getStats()
    ).data;
    createdCount.value = created_count;
    expiringSoonCount.value = expiring_soon_count;
    viewCount.value = view_count;
  } catch (err) {
    // Handle error
  }
}

onMounted(() => {
  fetchData();
  // 30-second interval to fetch data
  const interval = setInterval(fetchData, 30000);

  onBeforeUnmount(() => {
    clearInterval(interval);
  });
});

function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + "K";
  return (num / 1000000).toFixed(1) + "M";
}

function redirectToCreateMessagePage() {
  // In Vue 3 with TypeScript, you might need to type the router usage.
  // For example, if using Vue Router 4, you could do something like this:
  // useRouter().push({ name: "new-message", query: { ref: "cta" } });
  // This example assumes you've set up Vue Router 4 with named routes.
}
</script>

<template>
  <div class="home">
    <h1>Welcome to Whispeer</h1>

    <p class="intro">
      Create and share secure, encrypted messages that auto-expire in 24 hours.
    </p>

    <button class="cta-button" @click="redirectToCreateMessagePage">
      {{ ctaButtonTitle }}
    </button>

    <div class="statistics">
      <h2 class="stats-title">Messages</h2>
      <div class="stat-groups">
        <div class="stat-item">
          <span class="stat-value">{{ formatNumber(createdCount) }}</span>
          <p>Created</p>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatNumber(viewCount) }}</span>
          <p>Viewed</p>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatNumber(expiringSoonCount) }}</span>
          <p>Expiring Soon</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";
@import "@/assets/scss/home.scss";
</style>
