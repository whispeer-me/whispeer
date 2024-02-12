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
  background-color: $background-color;
  color: $secondary-color;
  border: 1px solid $divider-color;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;

  @media (max-width: 767px) {
     width: calc(100vw - 20px);
     margin: 10px;
     box-sizing: border-box;
   }

  &:hover {
    transform: translateY(5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    border-color: $hover-color;
  }

  .image-container img {
    transition: opacity 0.3s ease;
    &:hover {
      opacity: 0.9;
    }
  }

  h2 {
    color: $primary-color;
    font-family: $secondary-font;
    font-size: 18px;
  }

  p, ul, li {
    font-family: $secondary-font;
    color: $secondary-color;
    padding: 1em;
  }

  ul {
     list-style-type: none;
     text-align: left;

    li {
      position: relative;

      &:before {
        content: '•';
        color: $primary-color;
        position: absolute;
        left: 0;
      }
    }
  }
}
</style>
