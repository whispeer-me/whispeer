// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <p v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </p>
</template>

<script setup lang="ts">
defineProps<{
  errorMessage: null;
}>();
</script>
