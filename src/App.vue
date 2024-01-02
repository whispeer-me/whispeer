<template>
  <div id="app">
    <nav class="main-nav">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
      <router-link to="/new" class="nav-link">New Message</router-link>
    </nav>
    <hr class="divider" />
    <router-view />
    <AppFooter />
  </div>
</template>

<script>
import AppFooter from "@/components/main/AppFooter.vue";

export default {
  components: {
    AppFooter,
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/app.scss";

#app {
  @extend %lcd-font;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

body {
  background-color: $background-color;
}

.divider {
  @extend %divider;
}

.main-nav {
  padding: 30px;
  background-color: rgba(0, 0, 0, 0.7);
  text-align: left;

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
