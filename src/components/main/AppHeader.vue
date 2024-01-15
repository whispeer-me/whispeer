<template>
  <div class="header">
    <nav class="main-nav">
      <img :src="logo" alt="Logo" class="logo" />
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
<script>
import Vue from "vue";
import logo from "/src/assets/logo.png";

import homeIcon from "@/assets/icons/home.svg";
import messageIcon from "@/assets/icons/message.svg";
import storyIcon from "@/assets/icons/the-story.svg";
import codeIcon from "@/assets/icons/code.svg";
import contactIcon from "@/assets/icons/contact.svg";

export default Vue.extend({
  name: "AppHeader",
  data() {
    return {
      logo: logo,
      homeIcon,
      messageIcon,
      storyIcon,
      codeIcon,
      contactIcon,
      isMobile: window.innerWidth <= 480,
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 480;
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/app.scss";

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: $background-color;
  color: white;
  text-align: center;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  height: $header-height;
  overflow-x: auto;
  overflow-y: hidden;

  // Hide scrollbar for Webkit browsers (like Chrome and Safari)
  &::-webkit-scrollbar {
    display: none; // For Webkit browsers
  }

  // Hide scrollbar for IE, Edge, and Firefox
  -ms-overflow-style: none; // IE and Edge
  scrollbar-width: none; // Firefox
}

.main-nav {
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  text-align: left;
  $min-width: 80vw;
  $optimal-view-width: 150vw;
  min-width: $min-width;

  /* Media Query for Mobile Devices */
  @media (max-width: 480px) {
    min-width: $optimal-view-width;
  }

  /* Media Query for low resolution  Tablets, Ipads */
  @media (min-width: 481px) and (max-width: 767px) {
    min-width: $optimal-view-width;
  }

  /* Media Query for Tablets Ipads portrait mode */
  @media (min-width: 768px) and (max-width: 1024px) {
    min-width: $min-width;
  }

  /* Media Query for Laptops and Desktops */
  @media (min-width: 1025px) and (max-width: 1280px) {
    min-width: $min-width;
  }

  /* Media Query for Large screens */
  @media (min-width: 1281px) {
    min-width: $min-width;
  }

  .nav-link {
    @extend %lcd-font;
    font-size: 18px;
    color: $primary-color;
    text-decoration: none;
    margin: 0 15px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
    display: inline-block;

    &:hover,
    &.router-link-exact-active {
      opacity: 1;
    }
  }
  .logo {
    max-height: 35px;
    margin-right: 20px;
  }

  @media (max-width: 480px) {
    .icon-mobile {
      font-size: 28px; /* Adjust the font size as needed for larger icons */
    }
  }
}
</style>
