// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <section class="section">
    <div class="icon">
      <NuxtPicture
        preload
        :src="`/icons/how/${icon}`"
        :alt="title"
        width="64px"
        class="svg-color"
        loading="lazy"
      />
    </div>

    <h2>{{ title }}</h2>

    <p>
      {{ description }}
    </p>
    <ul v-if="items">
      <li v-for="(item, index) in items" :key="index">
        {{ item }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  icon: {
    type: String,
    required: true,
  },
  items: {
    type: Array as PropType<string[]>,
    required: false,
    default: () => [],
  },
});
</script>

<style scoped lang="scss">
h2 {
  color: $primary-color;
  font-family: $secondary-font;
  font-size: 18px;
}

p {
  font-family: $secondary-font;
  color: $secondary-color;
  font-size: 18px;
  padding: 1em;
}

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

    p {
      color: #fff;
    }

    .icon {
      opacity: 0.5;
    }
  }

  .icon {
    margin-top: 10px;
    transition: opacity 0.3s ease;
  }
}
</style>
