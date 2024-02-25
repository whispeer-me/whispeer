// SPDX-License-Identifier: AGPL-3.0-only

<script setup lang="ts">
defineProps<{
  isMobile: boolean;
  title: string;
  icon: string;
  to: string;
}>();
</script>

<template>
  <NuxtLink :to="to" class="nav-link">
    <NuxtPicture
      preload
      v-if="isMobile"
      :src="`/icons/menu/${icon}`"
      :alt="title"
      class="icon-mobile svg-color"
      width="24"
      height="24"
      loading="lazy"
    />
    <span v-if="!isMobile">{{ title }}</span>
  </NuxtLink>
</template>
