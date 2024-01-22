<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const isVisible = false;

const openModal = () => {
  isVisible = true;
};

const closeModal = () => {
  isVisible = false;
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";
@import "@/assets/scss/modal.scss";
</style>
