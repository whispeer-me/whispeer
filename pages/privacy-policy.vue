// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="privacy-policy">
    <h1>Privacy Policy</h1>

    <h2>No Accounts</h2>
    <p>
      Whispeer has no sign-up, login or user accounts, and does not assign any
      user identifier.
    </p>

    <h2>What We Store</h2>
    <p>
      <b>Per message:</b> a random message ID, the message content, the salt
      and initialization vector (IV) for encrypted messages, whether the message
      is encrypted, how many times it has been opened, and when it was created.
    </p>
    <p>
      <b>Encrypted messages:</b> when you choose the "Secure Message" option,
      the message is encrypted in your browser and only the encrypted form is
      sent to and stored on our server. Your passphrase is never sent to our
      server and is not part of the message link.
    </p>
    <p>
      <b>Non-encrypted messages:</b> if the "Secure Message" option is not
      selected (the default), the message is sent to our server and stored as
      plain text, and anyone with the link can read it. We recommend the
      "Secure Message" option for anything sensitive.
    </p>
    <p>
      The application does not store IP addresses, browser details or any user
      identifier in its database.
    </p>

    <h2>Message Handling and Deletion</h2>
    <p>
      <b>Expiry:</b> a message can be opened any number of times until it
      expires, 24 hours after it was created. After that it can no longer be
      retrieved.
    </p>
    <p>
      <b>Deletion:</b> an automatic job runs every hour and deletes messages
      older than 24 hours from our database. An expired message may therefore
      remain stored for up to about one more hour, or longer if the server is
      not running when the job is due.
    </p>

    <h2>Message IDs</h2>
    <p>
      To make sure message IDs (part of the message link) are never reused,
      every ID that has been issued is kept permanently in a separate
      'archived_ids' database table. Only the ID itself is stored there, with
      no content, timestamp or user information.
    </p>

    <h2>Analytics</h2>
    <p>
      We use <a href="https://plausible.io/">Plausible.io</a> for analytics. It
      records page views on all pages, clicks on links to other websites, and
      these events: a message was created, a message was viewed, and "create
      another message" was clicked, each with whether the message was
      encrypted. On message pages the message ID is removed from the address
      before it is sent, and the referring page is not sent. What Plausible
      itself processes (for example, data derived
      from your IP address and browser) is described in
      <a href="https://plausible.io/data-policy">Plausible's data policy</a>.
    </p>

    <h3>Aggregate Statistics</h3>
    <p>
      Whispeer keeps three overall numbers, shown on the homepage: the total
      number of messages ever created, the total number of times messages have
      been opened, and the number of messages currently stored (shown as
      "expiring soon"). These are single totals for the whole service; nothing
      is recorded per user.
    </p>

    <h3>Browser Storage</h3>
    <p>
      Your browser's local storage keeps two counters that limit how often a
      tooltip and a disclaimer are shown to you. They are not sent to our
      server.
    </p>

    <h2>Logging</h2>
    <p>
      The application does not log requests, IP addresses or message content.
      It only logs the status of the hourly deletion job and some server
      errors. Our hosting and database providers may keep their own technical
      logs (for example of connections or requests), which are outside the
      application.
    </p>

    <h2>Encryption Details</h2>
    <p>
      For "Secure Message", your browser generates a random 128-bit salt and a
      random 128-bit IV for each message, derives a 256-bit key from your
      passphrase with PBKDF2 (1,000 iterations), and encrypts the message with
      AES-256 in CBC mode with PKCS#7 padding, using the crypto-js library.
      Decryption also happens in the browser.
    </p>
    <p>
      <b>Limitations:</b> the encrypted data is not separately protected
      against tampering, and 1,000 PBKDF2 iterations make weak passphrases
      easier to guess for anyone who obtains the encrypted message. The
      encryption code is served by our website, so you are trusting the code we
      deliver.
    </p>

    <h2>User Responsibilities</h2>
    <p>
      <b>Passphrase Security:</b> the security of an encrypted message depends
      on the strength and confidentiality of its passphrase. Use a strong,
      unique passphrase.
    </p>
    <p>
      <b>Cautious Sharing:</b> share the passphrase through a different channel
      than the message link.
    </p>

    <h2>Updates and Feedback</h2>
    <p>
      <b>Policy Updates:</b> we may update this Privacy Policy from time to
      time. Changes will be posted on this page with a new date below.
    </p>
    <p>
      <b>Open Communication:</b> your feedback is important to us. Feel free to
      reach out with any concerns or suggestions regarding our privacy
      practices.
    </p>

    <p><b>Last updated: Nov 20th, 2026</b></p>
  </div>
</template>

<script setup lang="ts">
const { trackPageView } = useAnalytics();

useHead({
  title: "Privacy Policy - Whispeer",
  meta: [
    {
      name: "description",
      content:
        "Explore Whispeer's commitment to privacy. Read our privacy policy to understand how we handle and protect your data.",
    },
  ],
});

onMounted(() => {
  trackPageView();
});
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.privacy-policy {
  color: $secondary-color;
  font-family: $secondary-font;
  text-align: left;
  margin: 0 20px 100px 20px;

  h1 {
    text-align: center;
  }
}
</style>
