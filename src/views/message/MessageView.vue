<template>
  <div class="message">
    <ChiperDisplay v-if="message" :message="message" />
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
import ChiperDisplay from "@/components/message/ChiperDisplay.vue";
import MessageService from "@/services/MessageService";
import CryptoService from "@/services/CryptoService";

export default {
  name: "MessageView",
  components: {
    ChiperDisplay,
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
    };
  },
  async mounted() {
    await this.getTheMessage();
  },
  methods: {
    async getTheMessage() {
      try {
        const message = (await MessageService.getMessage(this.id)).data;
        await this.handleMessageRetrieval(message);
      } catch (error) {
        this.handleError(error);
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
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";
</style>
