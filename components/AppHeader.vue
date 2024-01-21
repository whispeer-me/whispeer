<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import homeIcon from "@/assets/icons/home.svg";
import messageIcon from "@/assets/icons/message.svg";
import storyIcon from "@/assets/icons/the-story.svg";
import codeIcon from "@/assets/icons/code.svg";
import contactIcon from "@/assets/icons/contact.svg";

const isMobile = ref<boolean>(false);

function handleResize() {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth <= 480;
  }
}

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="header">
    <nav class="main-nav">
      <img src="/logo.png" alt="Whisper Logo" class="logo" />
      <router-link to="/" class="nav-link">
        <img v-if="isMobile" :src="homeIcon" alt="Home" class="icon-mobile" />
        <span v-if="!isMobile">Home</span>
      </router-link>
      <router-link to="/m/new?ref=nav" class="nav-link">
        <img
          v-if="isMobile"
          :src="messageIcon"
          alt="New Message"
          class="icon-mobile"
        />
        <span v-if="!isMobile">New Message</span>
      </router-link>
      <router-link to="/the-story" class="nav-link">
        <img
          v-if="isMobile"
          :src="storyIcon"
          alt="The Story"
          class="icon-mobile"
        />
        <span v-if="!isMobile">The Story</span>
      </router-link>
      <router-link to="/code" class="nav-link">
        <img v-if="isMobile" :src="codeIcon" alt="Code" class="icon-mobile" />
        <span v-if="!isMobile">Code</span>
      </router-link>
      <router-link to="/contact" class="nav-link">
        <img
          v-if="isMobile"
          :src="contactIcon"
          alt="Contact"
          class="icon-mobile"
        />
        <span v-if="!isMobile">Contact</span>
      </router-link>
    </nav>
  </div>
</template>

<style lang="scss">
@import url("~/assets/scss/header.scss");
</style>
