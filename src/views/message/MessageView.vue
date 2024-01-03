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
      let message = null;
      try {
        message = await MessageService.getMessage(this.id);
      } catch (error) {
        console.error("Error in getTheMessage:", error);
        if (error.status === 404) {
          let messageNotFoundOrExpired = "Message not found or has expired.";
          this.errorMessage = error.message || messageNotFoundOrExpired;
        } else {
          this.errorMessage =
            error.message || "Failed to load message. Please try again later.";
        }
        return;
      }

      if (message && message.isPrivate) {
        const passphrase = prompt(
          "Enter the passphrase to decrypt the message"
        );
        this.message = await this.decryptMessage(message, passphrase);
      } else {
        this.message = message.content;
      }
    },

    async decryptMessage(message, passphrase) {
      try {
        const decryptedMessage = await CryptoService.decrypt(
          message.content,
          passphrase,
          message.salt,
          message.iv
        );
        return decryptedMessage;
      } catch (error) {
        console.error(error);
        this.errorMessage = "Decryption failed. Please check the passphrase.";
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";
</style>
