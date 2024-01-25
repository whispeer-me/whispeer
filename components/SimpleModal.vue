<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
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

const closeModal = () => {
  isVisible.value = false;
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";
@import "@/assets/scss/modal.scss";
</style>
