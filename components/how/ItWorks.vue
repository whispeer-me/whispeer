<template>
  <section class="how-it-works">
    <h1>How Whispeer Works</h1>

    <div class="content">

      <HowSection title="Whispeer Protects Your Privacy" description="Whispeer offers advanced security for your messages. We use client-side
      encryption, automatic message deletion, and privacy-focused analytics to
      guarantee that your conversations stay confidential." />

      <HowSection title="On Device Encryption"
        description="When you create a secure message on Whispeer, it's encrypted right within your web browser or mobile device. This means that only you and the person you share the passphrase with can ever read the message – not even Whispeer can access it." />

      <HowSection title="Disappearing Messages"
        description="Every message on Whispeer has a lifespan of 24 hours. After that, it's automatically and permanently deleted from our servers. You don't have to worry about old messages hanging around." />

      <HowSection title="Understanding Usage"
        description="To make Whispeer better, we use anonymized analytics. This means we track overall usage patterns, but without collecting any personal information about you. We'll never compromise your privacy for data." />

      <HowSection title="Strong Passphrases Are The Key"
        description="When you choose to encrypt a message, your passphrase is vital. Here's how to make strong passphrases:"
        :items="['Use a mix of letters, numbers, and symbols.', 'Make them at least 12 characters long.', 'Never reuse passphrases on other websites or services.']" />
    </div>
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
.how-it-works {
  margin-top: 50px;

  .content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    gap: 20px;

    >* {
      // Targets all direct children in the .content div
      margin-bottom: 40px;
    }
  }

  h1 {
    font-size: 42px;
  }
}
</style>
