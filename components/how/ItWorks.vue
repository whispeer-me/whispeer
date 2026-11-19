// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="content">
    <section class="how-it-works">
      <h1>How Whispeer Works</h1>
      <p class="intro">
        Whispeer makes secure messaging easy. Your privacy is our priority.
      </p>

      <div class="content">
        <HowSection
          icon="shield-lock.svg"
          title="Strong Encryption"
          description="Every message is encrypted on your device. Our server only stores ciphertext it can not read."
        />

        <HowSection
          icon="hourglass-bottom.svg"
          title="Messages Disappear"
          description="Messages are deleted after 24 hours, or right after the first view if you choose."
        />

        <HowSection
          icon="key.svg"
          title="The Key is in the Link"
          description="The key lives after the # in the link and never reaches our server. Add an optional passphrase for extra protection."
        />

        <HowSection
          icon="share.svg"
          title="Secure Sharing"
          description="Anyone with the link (and the passphrase, if set) can read the message, so share it only with the right person."
        />

        <HowSection
          icon="eye-slash.svg"
          title="Privacy Focused"
          description="We use anonymized analytics to improve Whispeer – never compromising your privacy."
        />
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
