<template>
  <div class="message">
    <LoadingIndicator :isLoading="isLoading" />
    <p v-if="errorMessage != null" class="error-message">
      {{ errorMessage }}
    </p>
    <ChiperDisplay v-if="message" :message="message" class="chiper-display" />

    <SimpleModal ref="simpleModal" class="passphrase-modal">
      <h3>Enter Passphrase</h3>
      <p>Please enter the passphrase to decrypt the message.</p>
      <input
        type="password"
        v-model="passphrase"
        placeholder="Enter the passphrase"
        class="passphrase-input"
        required
      />
      <div class="modal-buttons">
        <button @click="onModalSubmit">Decrypt the message</button>
        <button @click="closeModal">Cancel</button>
      </div>
    </SimpleModal>
  </div>
</template>

<script>
import ChiperDisplay from "@/components/message/ChiperDisplay.vue";
import SimpleModal from "@/components/common/SimpleModal.vue";

import LoadingIndicator from "@/components/common/LoadingIndicator.vue";
import MessageService from "@/services/MessageService";
import CryptoService from "@/services/CryptoService";

export default {
  name: "MessageView",
  metaInfo() {
    return {
      title: "Whispeer - Private Message",
      meta: [
        {
          vmid: "og:description",
          property: "og:description",
          content:
            "Someone has sent you a private message on Whispeer and it will expire in 24 hours.",
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: "Whispeer - Private Message",
        },
        {
          vmid: "og:image",
          property: "og:image",
          content: this.fullImageUrl,
        },
        {
          vmid: "og:type",
          property: "og:type",
          content: "website",
        },
        {
          vmid: "twitter:card",
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],
    };
  },
  components: {
    ChiperDisplay,
    LoadingIndicator,
    SimpleModal,
  },
  data() {
    return {
      message: null,
      errorMessage: null,
      isLoading: true,
      passphrase: null,
      resolvePassphrase: null,
      rejectPassphrase: null,
    };
  },
  computed: {
    fullImageUrl() {
      return window.location.origin + "/logo.png";
    },
  },
  async mounted() {
    if (this.$route.hash) {
      await this.processHashChange(this.$route.hash);
    }
  },
  watch: {
    async "$route.hash"(newHash) {
      await this.processHashChange(newHash);
    },
  },
  methods: {
    async processHashChange(hash) {
      const messageId = hash.substring(1); // Removes the '#' from the hash
      if (messageId) {
        await this.getTheMessage(messageId);
      } else {
        this.errorMessage =
          "No message ID provided in the url. Please ensure the url includes # followed by the message ID";
      }
    },
    async getTheMessage(messageId) {
      this.isLoading = true;
      this.errorMessage = null;
      this.message = null;
      try {
        const message = (await MessageService.getMessage(messageId)).data;
        await this.handleMessageRetrieval(message);
        this.logAnalytics(message);
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    async handleMessageRetrieval(message) {
      if (!message) {
        this.errorMessage = "No message data received.";
        return;
      }

      if (message.is_private) {
        // Wait for passphrase submission
        const passphrase = await this.showPassphraseModal();
        this.decryptMessage(message, passphrase);
      } else {
        this.message = message.content;
      }
    },

    async decryptMessage(message, passphrase) {
      if (!message.content) {
        this.errorMessage = "No message content available for decryption.";
        return;
      }

      try {
        this.message = await CryptoService.decrypt(
          message.content,
          passphrase,
          message.salt,
          message.iv
        );
      } catch (error) {
        this.errorMessage = "Decryption failed. Please check the passphrase.";
      }
    },

    handleError(error) {
      const serverMessage =
        error.response &&
        error.response.data &&
        error.response.data.data.message;

      if (error.response && error.response.status === 404) {
        this.errorMessage =
          serverMessage || "Message not found or has expired.";
      } else {
        this.errorMessage =
          serverMessage || "Failed to load message. Please try again later.";
      }
    },

    showPassphraseModal() {
      this.$refs.simpleModal.openModal();

      return new Promise((resolve, reject) => {
        this.resolvePassphrase = resolve;
        this.rejectPassphrase = reject;
      });
    },

    closeModal() {
      this.$refs.simpleModal.closeModal();
      if (this.rejectPassphrase) {
        this.rejectPassphrase("Modal closed by user");
        this.rejectPassphrase = null; // Reset the reject function
      }
    },

    onModalSubmit() {
      if (this.passphrase) {
        // Resolve the Promise with the passphrase
        this.resolvePassphrase(this.passphrase);
        this.passphrase = null; // Reset passphrase
        this.closeModal();
      } else {
        this.errorMessage = "Passphrase is required for decryption.";
      }
    },

    logAnalytics() {
      this.$analytics.trackEvent("message-viewed", {
        props: { is_private: this.message.is_private },
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.chiper-display {
  margin-top: 16px;
  margin-bottom: 16px;
}

.passphrase-modal {
  font-family: $secondary-font;
}

.passphrase-input {
  @extend %input-style;
  width: 80%;
  margin: 20px;
  padding: 10px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  button {
    margin-left: 8px;
  }
}
</style>
