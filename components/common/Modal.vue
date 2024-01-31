<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content" @click.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/modal.scss";
</style>
