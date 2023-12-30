<template>
  <div id="app">
    <nav class="main-nav">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
    </nav>
    <hr class="divider" />
    <router-view />
  </div>
</template>

<style lang="scss">
@font-face {
  font-family: "LCD-Solid";
  src: url("@/assets/fonts/LCD-Solid.ttf.woff") format("woff"),
    url("@/assets/fonts/LCD-Solid.ttf.svg#LCD-Solid") format("svg"),
    url("@/assets/fonts/LCD-Solid.ttf.eot"),
    url("@/assets/fonts/LCD-Solid.ttf.eot?#iefix") format("embedded-opentype");
  font-weight: normal;
  font-style: normal;
}

#app {
  font-family: "LCD-Solid", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  background-color: #000;
}

.divider {
  border: none;
  height: 2px;
  background-color: #c4872b;
  margin: 0;
}

.main-nav {
  padding: 30px;
  background-color: rgba(0, 0, 0, 0.7);
  text-align: left;

  .nav-link {
    font-family: "LCD-Solid", sans-serif;
    font-size: 24px;
    color: #c4872b;
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
