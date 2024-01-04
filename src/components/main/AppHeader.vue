<template>
  <div class="header">
    <nav class="main-nav">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
      <router-link to="/m/new" class="nav-link">Message</router-link>
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
  width: 100%;
  z-index: 1000;
  height: $header-height;
  overflow: scroll;
  overflow-x: auto;
  overflow-y: hidden;
}

.main-nav {
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  text-align: left;
  width: fit-content;

  .nav-link {
    @extend %lcd-font;
    font-size: 24px;
    color: $primary-color;
    text-decoration: none;
    margin: 0 15px;
    opacity: 0.7;
    transition: opacity 0.3s ease;

    &:hover,
    &.router-link-exact-active {
      opacity: 1;
    }
  }
}
</style>
