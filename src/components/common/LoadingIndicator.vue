<template>
  <div v-if="isLoading" class="loading-indicator">{{ text }}</div>
</template>

<script>
export default {
  name: "LoadingIndicator",
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: "L o a d i n g . . .",
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";
</style>
