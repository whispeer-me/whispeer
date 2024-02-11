<template>
  <section class="how-it-works-page">
    <h1>How Whispeer Protects Your Privacy</h1>

    <p class="intro">
      Whispeer offers advanced security for your messages. We use client-side
      encryption, automatic message deletion, and privacy-focused analytics to
      guarantee that your conversations stay confidential.
    </p>

    <CommonImage src="/images/whispeer-how-it-works.webp" alt="Whispeer Security Features" />

    <section class="section client-side-encryption">
      <h2>Your Messages, Encrypted Before They Leave Your Device</h2>
      <div class="encryption-diagram"> </div>
      <p>
        When you create a secure message on Whispeer, it's encrypted right
        within your web browser or mobile device. This means that only you and
        the person you share the passphrase with can ever read the message – not
        even Whispeer can access it.
      </p>
    </section>

    <section class="section secure-message-handling">
      <h2>Disappearing Messages: How We Do It</h2>
      <div class="disappearing-message-diagram"> </div>
      <p>
        Every message on Whispeer has a lifespan of 24 hours. After that, it's
        automatically and permanently deleted from our servers. You don't have to
        worry about old messages hanging around.
      </p>
    </section>

    <section class="section privacy-first-analytics">
      <h2>Understanding Usage, Protecting Your Data</h2>
      <div class="privacy-analytics-diagram"> </div>
      <p>
        To make Whispeer better, we use anonymized analytics. This means we
        track overall usage patterns, but without collecting any personal
        information about you. We'll never compromise your privacy for data.
      </p>
    </section>

    <section class="section user-responsibilities">
      <h2>Strong Passphrases are Key</h2>
      <div class="strong-passphrases-diagram"> </div>
      <p>
        When you choose to encrypt a message, your passphrase is vital. Here's
        how to make strong passphrases:
      </p>
      <ul>
        <li>Use a mix of letters, numbers, and symbols.</li>
        <li>Make them at least 12 characters long.</li>
        <li>Never reuse passphrases on other websites or services.</li>
      </ul>
    </section>
  </section>
</template>


<script setup lang="ts">
useHead({
  title: "How Whispeer Protects Your Privacy",
  meta: [
    {
      name: "description",
      content:
        "Explore Whispeer's commitment to privacy. Read our privacy policy to understand how we handle and protect your data.",
    },
  ],
});
</script>


<style scoped lang="scss">
@mixin sharedSectionStyles {
  font-family: $secondary-font;
  color: $secondary-color;

  h1 {
    font-family: $secondary-font;
  }

  h2 {
    font-family: $secondary-font;
  }

  p {
    color: $secondary-color;
    font-family: $secondary-font;
  }

  ul {
    list-style-type: none;
  }
}

.how-it-works-page {
  margin: 0px 20px 0px 20px;
}

.section {
  @include sharedSectionStyles;
}

.intro {
  color: $secondary-color;
  font-family: $secondary-font;
}

.feature-image {
  width: 90vw;
  height: 56.25vw;
  max-height: 100vh;
  object-fit: cover;
}
</style>
