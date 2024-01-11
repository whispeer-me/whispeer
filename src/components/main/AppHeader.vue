<template>
  <div class="header">
    <nav class="main-nav">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/m/new?ref=nav" class="nav-link"
        >New Message</router-link
      >
      <router-link to="/the-story" class="nav-link">The Story</router-link>
      <router-link to="/code" class="nav-link">Code</router-link>
      <router-link to="/contact" class="nav-link">Contact</router-link>
    </nav>
  </div>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
  name: "AppHeader",
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/app.scss";

.header {
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
}
</style>
