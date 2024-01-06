<template>
  <div class="message">
    <LoadingIndicator :isLoading="isLoading" />
    <p v-if="!message && errorMessage" class="error-message">
      {{ errorMessage }}
    </p>
    <ChiperDisplay v-if="message" :message="message" class="chiper-display" />
  </div>
</template>

<script>
import ChiperDisplay from "@/components/message/ChiperDisplay.vue";
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
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      message: null,
      errorMessage: null,
      isLoading: true,
    };
  },
  computed: {
    fullImageUrl() {
      return window.location.origin + "/whispeer-me-og-image.png";
    },
  },
  async mounted() {
    await this.getTheMessage();
  },
  methods: {
    async getTheMessage() {
      this.isLoading = true;
      this.errorMessage = null;
      this.message = null;
      try {
        const message = (await MessageService.getMessage(this.id)).data;
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

      if (message.isPrivate) {
        const passphrase = prompt(
          "Enter the passphrase to decrypt the message"
        );
        if (passphrase) {
          await this.decryptMessage(message, passphrase);
        } else {
          this.errorMessage = "Passphrase is required for decryption.";
        }
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
        console.error("Decryption error:", error);
        this.errorMessage = "Decryption failed. Please check the passphrase.";
      }
    },

    handleError(error) {
      console.error("Error:", error);

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

    logAnalytics() {
      this.$analytics.trackEvent("message-viewed", {
        props: { isPrivate: this.message.isPrivate },
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
</style>
