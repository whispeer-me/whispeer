// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="contact-page">
    <h1>Contact Us</h1>
    <p class="intro">
      We're always open to hearing from our users. Whether you have feedback,
      questions, or suggestions, we'd love to hear from you.
    </p>
    <p class="contact-info">
      Feel free to reach out to us at:
      <a href="mailto:hey@whispeer.me">hey@whispeer.me</a>
    </p>
    <p class="additional-info">
      Your insights help us make Whispeer better for everyone. Thank you for
      being a part of our community!
    </p>
  </div>
</template>

<script setup lang="ts">
const { trackPageView } = useAnalytics();

useHead({
  title: "Contact Us - Whispeer",
  meta: [
    {
      name: "description",
      content:
        "Reach out to Whispeer for feedback, questions, or suggestions. Your insights help us make Whispeer better for everyone. Contact us at hey@whispeer.me.",
    },
  ],
});

onMounted(() => {
  trackPageView();
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.contact-page {
  text-align: center;
  color: $secondary-color;
  margin: 0px 20px 0px 20px;
  font-family: $secondary-font;

  .intro,
  .contact-info,
  .additional-info {
    margin-bottom: 20px;
  }
}
</style>
