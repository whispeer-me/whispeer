<template>
  <div id="app" class="page-wrapper">
    <AppHeader />
    <hr class="divider" />
    <div class="content">
      <NuxtPage />
    </div>
    <AppFooter />
  </div>
</template>
<style scoped lang="scss">
@import "@/assets/scss/app.scss";
@import "@/assets/scss/home.scss";

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
