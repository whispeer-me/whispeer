<template>
  <div class="statistics">
    <h2 class="stats-title">Messages</h2>
    <div class="stat-groups">
      <MessageStatItem title="Created" :value="stats.createdCount" />
      <MessageStatItem title="Viewed" :value="stats.viewCount" />
      <MessageStatItem title="Expiring Soon" :value="stats.expiringSoonCount" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

const stats = ref({
  createdCount: 0,
  viewCount: 0,
  expiringSoonCount: 0
});

async function fetchStats() {
  try {
    const { created_count, expiring_soon_count, view_count } = (
      await messageService.getStats()
    ).data;
    stats.value.createdCount = created_count;
    stats.value.expiringSoonCount = expiring_soon_count;
    stats.value.viewCount = view_count;
  } catch (err) {
    // Handle error
  }
}

onMounted(() => {
  fetchStats();
  // 30-second interval to fetch data
  const interval = setInterval(fetchStats, 30000);

  onBeforeUnmount(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped lang="scss">
.statistics {
  text-align: center;
  margin-top: 80px;
  color: $primary-color;

  .stats-title {
    font-size: xx-large;
    margin-bottom: 40px;
  }

  .stat-groups {
    display: flex;
    justify-content: center;

    @media (max-width: 480px) {
      width: 80%;
      margin: 0 auto;
    }
  }
}
</style>
