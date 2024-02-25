// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="stat-item">
    <span class="stat-value">{{ formatNumber(value) }}</span>
    <p>{{ title }} </p>
  </div>
</template>

<script setup lang="ts">
defineProps(
  {
    title: { type: String, default: "" },
    value: { type: Number, default: 0 }
  }
)
</script>

<style scoped lang="scss">
.stat-item {
  margin: 0 20px;
  text-align: center;

  .stat-value {
    font-size: $heading-font-size;
    margin-bottom: 0.5em;
    transition: transform 0.5s ease-in-out;
  }

  p {
    font-size: $text-font-size;
    color: $secondary-color;

    @media (max-width: 480px) {
      font-size: 20px;
    }
  }
}
</style>
