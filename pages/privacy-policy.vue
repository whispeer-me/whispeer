// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="privacy-policy">
    <h1>Privacy Policy</h1>

    <h2>No Accounts</h2>
    <p>
      Whispeer has no sign-up, login or user accounts, and does not assign any
      user identifier.
    </p>

    <h2>Encryption</h2>
    <p>
      Every message is encrypted in your browser before it is sent. Your
      browser creates a random key for each message and puts it in the part of
      the link after <b>#</b>. Browsers never send that part to a server, so
      our server never receives the key, the message text or your passphrase.
    </p>
    <p>
      <b>Passphrase (optional):</b> if you add one, it is combined with the
      link key, so a message can only be read with both the full link and the
      passphrase.
    </p>
    <p>
      <b>Details:</b> AES-256-GCM encryption with a key derived by HKDF-SHA256
      from the 256-bit link key and, if set, your passphrase stretched with
      PBKDF2-SHA256 (600,000 iterations). A new random salt and IV are used for
      every message. Tampering with the stored data makes decryption fail.
    </p>

    <h2>What We Store</h2>
    <p>
      <b>Per message:</b> a random message ID, the encrypted content, the salt
      and IV, the encryption format version, whether it has a passphrase,
      whether it is deleted after the first view, how many times it has been
      opened, and when it was created. This cannot be decrypted without the
      link key, which we never have.
    </p>
    <p>
      The application does not store IP addresses, browser details or any user
      identifier.
    </p>

    <h2>Message Handling and Deletion</h2>
    <p>
      <b>Expiry:</b> a message can be read until 24 hours after it was
      created. An automatic job runs every minute and deletes expired messages
      from the database, or when the server starts again if it was not
      running.
    </p>
    <p>
      <b>Delete after first view:</b> if chosen, the message is deleted from
      the database when it is first opened, and cannot be opened again.
    </p>
    <p>
      <b>Message IDs:</b> to make sure IDs are never reused, every issued ID is
      kept in a separate table. Only the ID is stored there, with no content,
      timestamp or user information.
    </p>

    <h2>Analytics</h2>
    <p>
      We use <a href="https://plausible.io/">Plausible</a> for analytics. It
      records page views and these events: a message was created, a message was
      viewed, and "create another message" was clicked. Events carry only
      whether a message has a passphrase and whether it is deleted after the
      first view. On message pages the address is cut to <b>/m/</b> and the
      referring page is not sent, so the message ID and key never reach
      Plausible. Clicks on links to other websites are not tracked. What
      Plausible itself processes (for example, data derived from your IP
      address and browser) is described in
      <a href="https://plausible.io/data-policy">Plausible's data policy</a>.
    </p>

    <h3>Aggregate Statistics</h3>
    <p>
      The homepage shows three overall numbers: total messages created, total
      times messages were opened, and messages currently live. These are single
      totals for the whole service; nothing is recorded per user.
    </p>

    <h3>Browser Storage</h3>
    <p>
      Your browser's local storage keeps two counters that limit how often a
      tooltip and a disclaimer are shown to you. They are not sent to our
      server.
    </p>

    <h2>Logging and Abuse Protection</h2>
    <p>
      The application does not log requests, IP addresses or message content.
      It logs only the status of the deletion job and its errors. To limit
      abuse, the server counts requests per network address in memory for one
      minute; these addresses are never logged or stored. Hosting and database
      providers may keep their own technical logs, which are outside the
      application.
    </p>

    <h2>Limitations</h2>
    <p>
      Anyone with the full link can read a message that has no passphrase, so
      treat the link like the message itself. The encryption code is delivered
      by the website, so you are trusting the code it serves. Whispeer has not
      been audited by an independent security firm.
    </p>

    <h2>User Responsibilities</h2>
    <p>
      <b>Passphrase Security:</b> use a strong, unique passphrase for anything
      sensitive.
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
      <b>Feedback:</b> questions or concerns about privacy are welcome as an
      issue on
      <a href="https://github.com/whispeer-me/whispeer/issues">GitHub</a>.
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
