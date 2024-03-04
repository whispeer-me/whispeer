// SPDX-License-Identifier: AGPL-3.0-only

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import MenuItem from "./MenuItem.vue";

const isMobile = ref<boolean>(false);
const hasMounted = ref<boolean>(false);

function handleResize () {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth <= 480;
  }
}

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
  hasMounted.value = true;
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <header class="header">
    <nav v-if="hasMounted" class="main-nav">
      <NuxtImg
        src="/logo.png"
        alt="Whispeer Logo"
        class="logo"
        width="36"
        height="36"
        loading="lazy"
      />
      <MenuItem to="/" title="Home" icon="home.svg" :is-mobile="isMobile" />
      <MenuItem
        to="/m/new?ref=nav"
        title="New Message"
        icon="message.svg"
        :is-mobile="isMobile"
      />
      <MenuItem
        to="https://blog.whispeer.me"
        title="Blog"
        icon="blog.svg"
        :is-mobile="isMobile"
      />
      <MenuItem
        to="/the-story"
        title="The Story"
        icon="the-story.svg"
        :is-mobile="isMobile"
      />
      <MenuItem to="/code" title="Code" icon="code.svg" :is-mobile="isMobile" />
      <MenuItem
        to="/contact"
        title="Contact"
        icon="contact.svg"
        :is-mobile="isMobile"
      />
    </nav>
  </header>
</template>

<style lang="scss">
@import url("~/assets/scss/header.scss");
</style>
