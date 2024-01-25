<template>
  <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
</template>

<script setup lang="ts">
defineProps<{
  errorMessage: null;
}>();
</script>
