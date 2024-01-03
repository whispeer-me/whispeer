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
        const message = await MessageService.getMessage(this.id);
        console.log(message.content);
        // TODO: Handle not found case
        if (message.isPrivate) {
          const passphrase = prompt("Enter the passphrase");
          console.log("passphrase", passphrase);
          this.message = await this.decryptMessage(message, passphrase);
        } else {
          this.message = message.content;
        }
      } catch (error) {
        console.error(error);
        this.errorMessage = "Failed to load message. Please try again later.";
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
