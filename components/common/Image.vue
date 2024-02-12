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
  width: auto;
  height: 80vh;
  max-width: 90vw;
  object-fit: cover;
  margin: auto;
}
</style>
