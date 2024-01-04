<template>
  <div id="app">
    <AppHeader />
    <hr class="divider" />
    <div class="content">
      <router-view />
    </div>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from "@/components/main/AppHeader.vue";
import AppFooter from "@/components/main/AppFooter.vue";

export default {
  components: {
    AppHeader,
    AppFooter,
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/app.scss";

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  min-height: 100vh;
}

.divider {
  border: none;
  height: 2px;
  background-color: $divider-color;
  margin: 0;
}
</style>
