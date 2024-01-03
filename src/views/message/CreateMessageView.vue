<template>
  <div class="create-message-view">
    <h1>Create a New Message</h1>
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>

    <form @submit.prevent="submitMessage">
      <textarea
        v-model="message.content"
        placeholder="Type your message here..."
        required
      ></textarea>

      <div class="privacy-settings">
        <ToggleSwitch
          title="Private Message"
          :value="message.isPrivate"
          @change="handleToggleChange"
        />
      </div>

      <div v-if="message.isPrivate" class="passphrase">
        <input
          class="passphrase-input"
          type="password"
          v-model="message.passphrase"
          placeholder="Enter a passphrase to encrypt"
          required
        />
      </div>

      <div class="submit-button">
        <button type="submit">Send Message</button>
      </div>

      <div v-if="messageLink" class="message-link">
        <p>Share this link with your friends:</p>
        <p>{{ messageLink }}</p>
      </div>
    </form>
  </div>
</template>

<script>
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";
import CryptoService from "@/services/CryptoService";
import MessageService from "@/services/MessageService";

export default {
  name: "CreateMessageView",
  components: { ToggleSwitch },
  data() {
    return {
      message: {
        content: "",
        isPrivate: false,
        passphrase: "",
      },
      messageLink: null,
      errorMessage: null,
    };
  },
  methods: {
    async submitMessage() {
      this.$analytics.trackEvent("message-created", {
        props: { isPrivate: this.message.isPrivate },
      });

      try {
        const newMessage = this.prepareMessage();
        const result = await MessageService.createMessage(newMessage);

        if (result.id) {
          this.messageLink = `${window.location.origin}/message/${result.id}`;
          this.resetForm();
        }
      } catch (error) {
        this.errorMessage = "Failed to send message. Please try again.";
        console.error("Error submitting message:", error);
      }
    },

    prepareMessage() {
      const newMessage = {
        content: this.message.content,
        isPrivate: this.message.isPrivate,
      };

      if (this.message.isPrivate && this.message.passphrase) {
        const encryptedMessage = CryptoService.encrypt(
          this.message.content,
          this.message.passphrase
        );
        Object.assign(newMessage, {
          content: encryptedMessage.ciphertext,
          iv: encryptedMessage.iv,
          salt: encryptedMessage.salt,
        });
      }

      return newMessage;
    },

    resetForm() {
      this.message.content = "";
      this.message.isPrivate = false;
      this.message.passphrase = "";
    },

    handleToggleChange(newValue) {
      this.message.isPrivate = newValue;
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

$border-radius: 5px;
$input-padding: 10px;

.create-message-view {
  text-align: center;

  h1 {
    color: $primary-color;
  }

  textarea {
    width: 80%;
    height: 100px;
    margin: 10px 0;
    padding: $input-padding;
    font-size: 1em;
    border-radius: $border-radius;
    border: 1px solid $primary-color;
  }

  .privacy-settings {
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      margin-right: 10px;
    }

    .passphrase {
      width: 80%;
      margin: 10px auto;
    }
  }

  .passphrase-input {
    width: 80%;
    padding: $input-padding;
    font-size: 1em;
    border-radius: $border-radius;
    border: 1px solid $primary-color;
    margin-top: 20px;
  }

  .submit-button {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  button {
    @extend %button-style;
  }
}
</style>
