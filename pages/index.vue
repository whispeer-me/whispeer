<script setup lang="ts">
const { trackPageView } = useAnalytics();

const scrollToHowItWorks = () => {
  const howItWorksElement = document.querySelector('.how-it-works');
  howItWorksElement?.scrollIntoView({ behavior: 'smooth' });
};

function redirectToCreateMessagePage() {
  navigateTo({ path: "/m/new", query: { ref: "cta" } });
}

onMounted(() => {
  trackPageView();
});
</script>

<template>
  <div class="home">
    <h1>Your Secrets Stay Safe with Whispeer</h1>
    <p class="intro">
      Send messages that vanish after 24 hours. Powerful client-side encryption.
    </p>

    <button class="cta-button" @click="redirectToCreateMessagePage">
      Send Message
    </button>

    <button class="learn-more-button" @click="scrollToHowItWorks">
      Learn More
    </button>

    <HowItWorks />
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/scss/home.scss";
</style>
