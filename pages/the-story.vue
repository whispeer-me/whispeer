<template>
  <div class="the-story">
    <h1>The Story</h1>

    <section class="app-description">
      <h2>Whispeer.me: Secure Messaging for Everyone</h2>
      <p>
        Whispeer.me is more than just a messaging app; it's a commitment to
        secure and private communication. Inspired by the intricate storytelling
        of the
        <a
          href="https://www.imdb.com/title/tt5651844/?ref_=whispeer.me"
          target="_blank"
          >"Travelers"</a
        >
        TV series, Whispeer brings a blend of art and technology to your
        messages. It's an open-source project built on the principles of
        privacy, openness, and collaboration.
      </p>
      <p>
        Whether it's sending heartfelt congratulations, sharing a surprise
        celebration, or simply exchanging thoughts securely, Whispeer makes
        these moments special with beautifully animated presentations. Our goal
        is to create a space where every message feels personal and private,
        keeping your conversations safe and memorable.
      </p>
      <p>
        As an open-source project, Whispeer thrives on community collaboration.
        We invite developers, designers, and privacy enthusiasts to contribute
        to our journey, enhancing the way we communicate securely in the digital
        age.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "The Story - Whispeer",
  meta: [
    {
      name: "description",
      content:
        "Whispeer: A unique app combining secure messaging with artistic animations inspired by the Traveler TV series.",
    },
  ],
});
</script>

<style scoped lang="scss">
.the-story {
  color: $secondary-color;
  font-family: $secondary-font;
  margin: 0px 20px 0px 20px;
}
</style>
