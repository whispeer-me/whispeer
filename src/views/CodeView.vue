<template>
  <div class="code">
    <h1>Whispeer Open Source</h1>
    <div class="repo-section" v-for="repo in repositories" :key="repo.name">
      <h2>{{ repo.name }}</h2>
      <p><a :href="repo.url" target="_blank">Code</a></p>
      <p>
        <a :href="repo.url + '/contributors'" target="_blank">Contributors</a>
      </p>
      <p>
        <a :href="repo.url + '/blob/main/package.json'" target="_blank"
          >Libraries</a
        >
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      repositories: [
        {
          name: "Backend Repository",
          url: "https://github.com/whispeer-me/backend",
        },
        {
          name: "Frontend Repository",
          url: "https://github.com/whispeer-me/frontend",
        },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.repo-section {
  margin-bottom: 20px;
}

h2 {
  color: $primary-color;
}

a {
  color: $secondary-color;
  &:hover {
    color: $hover-color;
  }
}
</style>
