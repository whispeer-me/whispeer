<template>
  <div class="home">
    <ChiperDisplay
      msg="Hello World! Programming is awesome! Enjoy it while you can."
    />
  </div>
</template>

<script>
// @ is an alias to /src
import ChiperDisplay from "@/components/ChiperDisplay.vue";

export default {
  name: "HomeView",
  components: {
    ChiperDisplay,
  },
};
</script>
