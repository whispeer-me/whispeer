<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

@font-face {
  font-family: "LCD-Solid";
  src: url("@/assets/fonts/LCD-Solid.ttf.woff") format("woff"),
    url("@/assets//fonts/LCD-Solid.ttf.svg#LCD-Solid") format("svg"),
    url("@/assets/fonts/LCD-Solid.ttf.eot"),
    url("@/assets/fonts/LCD-Solid.ttf.eot?#iefix") format("embedded-opentype");
  font-weight: normal;
  font-style: normal;
}

body {
  background-color: #000;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #c4872b;
    opacity: 0.3;

    &.router-link-exact-active {
      color: #c4872b;
      opacity: 1;
    }
  }
}
</style>
