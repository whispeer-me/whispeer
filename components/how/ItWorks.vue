// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="content">
    <section class="how-it-works">
      <h1>How Whispeer Works</h1>
      <p class="intro">Whispeer makes secure messaging easy. Your privacy is our priority.</p>

      <div class="content">
        <HowSection icon="shield-lock.svg" title="Strong Encryption"
          description="Whispeer encrypts messages on your device – only you and the recipient can read them." />

        <HowSection icon="hourglass-bottom.svg" title="Messages Disappear"
          description="Messages are automatically deleted after 24 hours for maximum security." />

        <HowSection icon="key.svg" title="Passphrases are Key"
          description="Use strong, unique passphrases to make your messages ultra-secure." />

        <HowSection icon="share.svg" title="Secure Sharing"
          description="Share encrypted messages with unique links. Only the right person can unlock them." />

        <HowSection icon="eye-slash.svg" title="Privacy Focused"
          description="We use anonymized analytics to improve Whispeer – never compromising your privacy." />

      </div>
    </section>
  </div>
</template>

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
    font-size: 36px;
  }
}
</style>
