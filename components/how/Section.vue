<template>
<section class="section">
  <h2>{{ title }}</h2>
  <div v-if="image" class="image-container">
    <CommonImage :src="image" :alt="title" />
  </div>
  <p>
   {{ description }}
  </p>
  <ul v-if="items">
    <li v-for="(item, index) in items" :key="index"> {{ item }} </li>
  </ul>
</section>
</template>

<script setup lang="ts">
  defineProps({
    title: String,
    description: String,
    image: {
      type: String,
      required: false,
    },
    items: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    }
  })
</script>

<style scoped lang="scss">
.section {

  width: 90vh;
  height: 80vh;
  max-width: 90vw;
  margin: auto;

  h2 {
    font-family: $secondary-font;
  }

  p {
    font-size: large;
  }

  ul {
    list-style-type: none;
  }
}
</style>
