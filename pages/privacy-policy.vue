// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="privacy-policy">
    <h1>Privacy Policy</h1>

    <h2>Analytics</h2>
    <p>
      <b>Anonymous Analytics:</b> We use
      <a href="https://plausible.io/">Plausible.io</a> for analytics to improve
      Whispeer. Plausible is GDPR compliant and now focuses exclusively on
      tracking anonymized page view events on the message viewing page, using
      techniques that do not log any personal data. This adjustment in our
      analytics approach allows us to understand app usage while fully
      respecting user privacy, eliminating the need for user consent for
      tracking.
    </p>

    <h3>Aggregate Data Collection</h3>
    <p>
      <b>General Statistics:</b> Whispeer collects aggregate data such as the
      total number of messages created, the number of messages expiring soon,
      and the total view count of all messages. This information is used to
      provide statistical insights on our homepage and enhance user experience.
      Importantly, this data is purely statistical and does not include any
      personal or identifiable information about our users.
    </p>

    <h2>No Logging of Personal Data</h2>
    <p>
      <b>Respecting Privacy:</b> While we track anonymized usage data for
      analytics, we do not log any personal data or content of your messages.
      Your privacy and the confidentiality of your messages are our top
      priorities.
    </p>

    <h2>Message Handling and Deletion</h2>
    <p>
      <b>Automatic Deletion:</b> Messages in Whispeer are automatically deleted
      after 24 hours. This process ensures that your messages are not stored on
      our servers beyond this time frame.
    </p>

    <h2>Data Management</h2>
    <p>
      <b>Non-Personal Data Handling:</b> In order to ensure the uniqueness of
      each message's ID, which forms part of the URL used by users to access
      their messages, Whispeer employs a system of randomly generated IDs. These
      are stored in a dedicated 'archived_ids' database table. These IDs are
      essential for operational purposes, helping to maintain the integrity and
      performance of our messaging service. Importantly, these IDs do not
      contain any personal data and cannot be linked back to individual users,
      ensuring that your privacy is always protected.
    </p>

    <h2>Encryption and Security</h2>
    <p>
      <b>Client-Side Encryption:</b> Whispeer ensures your security by
      encrypting messages directly on your device. When you choose the "Secure
      Message" option while creating a message, the encryption is performed
      client-side. Consequently, only the encrypted form of your message is
      stored in our database, maintaining its confidentiality.
    </p>
    <p>
      <b>Non-Encrypted Messages:</b> If the "Secure Message" option is not
      selected, the message will be saved as plain text in our database. We
      recommend using the "Secure Message" option for sensitive communications.
    </p>
    <p>
      <b>Encryption Techniques:</b> Whispeer uses AES encryption for messages,
      uniquely encrypting each message with a passphrase.
    </p>
    <p>
      <b>Encryption Process:</b> The process involves generating a random salt
      and initialization vector (IV) for each encrypted message, ensuring
      enhanced security.
    </p>
    <p>
      <b>Passphrase-Based Encryption:</b> The encryption key is derived from
      your passphrase using PBKDF2, further securing each message.
    </p>
    <p>
      <b>CBC Mode and Pkcs7 Padding:</b> We use Cipher Block Chaining (CBC) mode
      and Pkcs7 padding for encryption, adhering to strong cryptographic
      standards.
    </p>

    <h2>User Responsibilities</h2>
    <p>
      <b>Passphrase Security:</b> We encourage users to use strong, unique
      passphrases for encrypting messages. The security of encrypted messages
      also depends on the strength and confidentiality of the passphrase.
    </p>
    <p>
      <b>Cautious Sharing:</b> Always be careful when sharing encrypted messages
      and passphrases to maintain privacy and security.
    </p>

    <h2>Updates and Feedback</h2>
    <p>
      <b>Policy Updates:</b> We may update this Privacy Policy from time to
      time. Users will be notified of significant changes.
    </p>
    <p>
      <b>Open Communication:</b> Your feedback is important to us. Feel free to
      reach out with any concerns or suggestions regarding our privacy
      practices.
    </p>

    <p><b>Last updated: Feb 20th, 2024</b></p>
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
