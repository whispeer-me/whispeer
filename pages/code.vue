<template>
  <div class="code">
    <h1>Whispeer is Open Source</h1>
    <div class="repo-section" v-for="repo in repositories" :key="repo.name">
      <h2>{{ repo.name }}</h2>
      <p>
        <a :href="repo.url" target="_blank" rel="noopener noreferrer">Code</a>
      </p>
      <p>
        <a
          :href="`${repo.url}/contributors`"
          target="_blank"
          rel="noopener noreferrer"
          >Contributors</a
        >
      </p>
      <p>
        <a
          :href="`${repo.url}/blob/main/package.json`"
          target="_blank"
          rel="noopener noreferrer"
          >Libraries</a
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const repositories = ref([
  {
    name: "Backend Repository",
    url: "https://github.com/whispeer-me/backend",
  },
  {
    name: "Frontend Repository",
    url: "https://github.com/whispeer-me/frontend",
  },
]);

useHead({
  title: "Code - Whispeer",
  meta: [
    {
      name: "description",
      content:
        "Dive into the coding world of Whispeer. Explore our open-source code, understand our tech stack, and contribute to the project.",
    },
  ],
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.repo-section {
  margin-bottom: 20px;
}
</style>
