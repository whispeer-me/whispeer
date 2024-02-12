<script setup lang="ts">
function redirectToCreateMessagePage() {
  navigateTo({ path: "/m/new", query: { ref: "cta" } });
}
</script>

<template>
  <div class="home">
    <h1>Your Secrets Stay Safe with Whispeer</h1>

    <p class="intro">
      Send messages that vanish after 24 hours. Powerful client-side encryption.
    </p>

    <button class="cta-button" @click="redirectToCreateMessagePage">
      Create a secure message
    </button>

    <MessageStats />

    <div class="how-it-works">
      <h1>How Whispeer Works</h1>

      <p class="intro">
        Whispeer offers advanced security for your messages. We use client-side
        encryption, automatic message deletion, and privacy-focused analytics to
        guarantee that your conversations stay confidential.
      </p>

      <div class="content">

        <div class="section">
          <h2>Your Messages, Encrypted Before They Leave Your Device</h2>
          <CommonImage src="/images/1.webp" alt="Whispeer Security Features" />

          <p>
            When you create a secure message on Whispeer, it's encrypted right within your web browser or mobile device.
            This means that only you and the person you share the passphrase with can ever read the message – not even
            Whispeer can access it.
          </p>

        </div>

        <div class="section">
          <h2>Your Messages, Encrypted Before They Leave Your Device</h2>
          <CommonImage src="/images/1.webp" alt="Whispeer Security Features" />

          <p>
            When you create a secure message on Whispeer, it's encrypted right within your web browser or mobile device.
            This means that only you and the person you share the passphrase with can ever read the message – not even
            Whispeer can access it.
          </p>

        </div>



        <div class="section">
          <h2>Your Messages, Encrypted Before They Leave Your Device</h2>
          <CommonImage src="/images/1.webp" alt="Whispeer Security Features" />

          <p>
            When you create a secure message on Whispeer, it's encrypted right within your web browser or mobile device.
            This means that only you and the person you share the passphrase with can ever read the message – not even
            Whispeer can access it.
          </p>

        </div>

        <div class="section">
          <h2>Your Messages, Encrypted Before They Leave Your Device</h2>
          <CommonImage src="/images/1.webp" alt="Whispeer Security Features" />

          <p>
            When you create a secure message on Whispeer, it's encrypted right within your web browser or mobile device.
            This means that only you and the person you share the passphrase with can ever read the message – not even
            Whispeer can access it.
          </p>

        </div>

        <div class="section">
          <h2>Your Messages, Encrypted Before They Leave Your Device</h2>
          <CommonImage src="/images/1.webp" alt="Whispeer Security Features" />

          <p>
            When you create a secure message on Whispeer, it's encrypted right within your web browser or mobile device.
            This means that only you and the person you share the passphrase with can ever read the message – not even
            Whispeer can access it.
          </p>

        </div>

        <div class="section">
          <h2>Your Messages, Encrypted Before They Leave Your Device</h2>
          <CommonImage src="/images/1.webp" alt="Whispeer Security Features" />

          <p>
            When you create a secure message on Whispeer, it's encrypted right within your web browser or mobile device.
            This means that only you and the person you share the passphrase with can ever read the message – not even
            Whispeer can access it.
          </p>

        </div>

      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import "@/assets/scss/home.scss";

.how-it-works {
  margin-top: 100px;

  .content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    align-items: center;
  }

  h1 {
    font-size: 42px;
  }

  .section {
    width: 50vh;

    p {
      font-family: $secondary-font;
    }

  }
}
</style>
