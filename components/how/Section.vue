<template>
<section class="section">
<div v-if="image" class="image-container">
  <CommonImage :src="image" :alt="title" />
</div>
  <h2>{{ title }}</h2>
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
  width: 50vh;

  p {
    font-family: $secondary-font;
    font-size: large;
  }

  h2 {
    font-family: $secondary-font;
  }

  ul {
    list-style-type: square;
    font-family: $secondary-font;
    text-align: left;
  }
}
</style>
