// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div v-if="isLoading" class="loading-indicator">{{ text }}</div>
</template>

<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "L o a d i n g . . .",
  },
});
</script>

<style scoped lang="scss"></style>
