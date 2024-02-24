<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isMobile = ref<boolean>(false);
const hasMounted = ref<boolean>(false);

function handleResize() {
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
      <NuxtLink to="/" class="nav-link">
        <NuxtImg
          v-if="isMobile"
          src="/icons/home.svg"
          alt="Home"
          class="icon-mobile svg-color"
          width="24"
          height="24"
          loading="lazy"
        />
        <span v-if="!isMobile">Home</span>
      </NuxtLink>
      <NuxtLink to="/m/new?ref=nav" class="nav-link">
        <NuxtImg
          v-if="isMobile"
          src="/icons/message.svg"
          alt="New Message"
          class="icon-mobile svg-color"
          width="24"
          height="24"
          loading="lazy"
        />
        <span v-if="!isMobile">New Message</span>
      </NuxtLink>
      <a
        href="https://blog.whispeer.me"
        class="nav-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <NuxtPicture
          v-if="isMobile"
          src="/icons/blog.svg"
          alt="Blog"
          class="icon-mobile svg-color"
          width="24"
          height="24"
          loading="lazy"
        />
        <span v-if="!isMobile">Blog</span>
      </a>
      <NuxtLink to="/the-story" class="nav-link">
        <NuxtPicture
          v-if="isMobile"
          src="/icons/the-story.svg"
          alt="The Story"
          class="icon-mobile svg-color"
          width="24"
          height="24"
          loading="lazy"
        />
        <span v-if="!isMobile">The Story</span>
      </NuxtLink>
      <NuxtLink to="/code" class="nav-link">
        <NuxtImg
          v-if="isMobile"
          src="/icons/code.svg"
          alt="Code"
          class="icon-mobile svg-color"
          width="24"
          height="24"
          loading="lazy"
        />
        <span v-if="!isMobile">Code</span>
      </NuxtLink>
      <NuxtLink to="/contact" class="nav-link">
        <NuxtPicture
          v-if="isMobile"
          src="/icons/contact.svg"
          alt="Contact"
          class="icon-mobile svg-color"
          width="24"
          height="24"
          loading="lazy"
        />
        <span v-if="!isMobile">Contact</span>
      </NuxtLink>
    </nav>
  </header>
</template>

<style lang="scss">
@import url("~/assets/scss/header.scss");
</style>
