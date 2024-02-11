<template>
  <NuxtImg preload :src="src" :alt="alt" class="image" fit="cover" format="webp" loading="lazy" />
</template>

<script setup lang="ts">
defineProps({
  src: String,
  alt: String
})
</script>

<style scoped lang="scss">
.image {
  width: 90vw;
  height: 56.25vw;
  max-height: 100vh;
  object-fit: cover;
}
</style>
