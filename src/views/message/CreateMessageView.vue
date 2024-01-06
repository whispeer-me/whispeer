<template>
  <div class="create-message-view">
    <h1>New Message</h1>
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>

    <form @submit.prevent="submitMessage">
      <textarea
        v-model="message.content"
        placeholder="Type your message here ..."
        :maxlength="maxCharsAllowed"
        required
      ></textarea>

      <p>Maximum characters allowed: {{ maxCharsAllowed }}.</p>

      <p v-if="shouldWarn" class="warning">
        {{ this.maxCharsAllowed - this.message.content.length }} characters
        left.
      </p>

      <div class="privacy-settings">
        <ToggleSwitch
          title="Secure Message"
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

      <div class="security-disclaimer">
        <p>
          Please note that while Whispeer provides enhanced encryption for
          messaging, <br />
          <b
            >it has not been audited by experts, and it is not made by security
            experts. </b
          ><br />
          It should not be solely relied upon for complete privacy or anonymity.
        </p>
      </div>

      <div class="submit-button">
        <button type="submit">Create Message</button>
      </div>

      <div v-if="messageLink" class="message-link">
        <p>Share this link with your friends:</p>
        <p
          title="Click to copy link"
          class="copyable-link"
          @click="copyLinkToClipboard"
        >
          {{ messageLink }}
        </p>
        <p v-if="messageCopiedToClipboard" class="link-copied">
          Copied to clipboard!
        </p>
        <p v-if="messageCopiedToClipboardFailed" class="link-copied-error">
          Can NOT copied to clipboard!
        </p>
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
      messageCopiedToClipboard: false,
      messageCopiedToClipboardFailed: false,
      maxCharsAllowed: 256,
      warningCharsLeft: 20,
    };
  },
  computed: {
    charsLeft() {
      return this.maxCharsAllowed - this.message.content.length;
    },
    shouldWarn() {
      return this.charsLeft < this.warningCharsLeft;
    },
  },
  methods: {
    async submitMessage() {
      if (this.message.content.length > this.maxCharsAllowed) {
        this.errorMessage = `Message exceeds ${this.maxCharsAllowed} characters.`;
        return;
      }

      this.errorMessage = "";
      let newMessage;

      try {
        newMessage = this.prepareAndMaybeEncryptTheMessage();
      } catch (error) {
        this.handleError(error, "Error during message encryption:");
        return;
      }

      try {
        const newlyCreatedMessage = await MessageService.createMessage(
          newMessage
        );
        this.handleSuccessfulSubmission(newlyCreatedMessage);
      } catch (error) {
        this.handleError(error, "Error submitting message to the server:");
      }
    },

    prepareAndMaybeEncryptTheMessage() {
      let newMessage = {
        content: this.message.content,
        isPrivate: this.message.isPrivate,
      };

      if (this.message.isPrivate && this.message.passphrase) {
        const encryptedMessage = CryptoService.encrypt(
          this.message.content,
          this.message.passphrase
        );

        newMessage.content = encryptedMessage.ciphertext;
        newMessage.iv = encryptedMessage.iv;
        newMessage.salt = encryptedMessage.salt;
      }

      return newMessage;
    },

    handleSuccessfulSubmission(newlyCreatedMessage) {
      if (newlyCreatedMessage.id) {
        this.messageLink = `${window.location.origin}/m/${newlyCreatedMessage.id}`;
        this.resetForm();
        this.logAnalytics();
      }
    },

    handleError(error, consoleMessage) {
      console.error(consoleMessage, error);
      this.errorMessage =
        error.response?.data?.data?.message || "An unexpected error occurred.";
    },

    resetForm() {
      this.errorMessage = null;
      this.message.content = "";
      this.message.isPrivate = false;
      this.message.passphrase = "";
    },

    handleToggleChange(newValue) {
      this.message.isPrivate = newValue;
    },

    logAnalytics() {
      this.$analytics.trackEvent("message-created", {
        props: { isPrivate: this.message.isPrivate },
      });
    },

    copyLinkToClipboard() {
      if (!navigator.clipboard) {
        return;
      }

      navigator.clipboard
        .writeText(this.messageLink)
        .then(() => {
          this.messageCopiedToClipboard = true;
          this.messageCopiedToClipboardFailed = false;

          setTimeout(() => {
            this.messageCopiedToClipboard = false;
          }, 3000);
        })
        .catch(() => {
          this.messageCopiedToClipboard = true;
          this.messageCopiedToClipboardFailed = true;
        });
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

  textarea {
    width: 80%;
    height: 100px;
    margin: 10px 0;
    padding: $input-padding;
    font-size: 1em;
    border-radius: $border-radius;
    border: 1px solid $primary-color;
  }

  p {
    color: $secondary-color;
  }

  p.warning {
    color: $primary-color;
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

  .security-disclaimer {
    font-family: $secondary-font;
    color: $secondary-color;
    margin: 16px;
    line-height: 1.5;
  }

  .message-link {
    color: $secondary-color;
    margin-top: 20px;

    .copyable-link {
      color: $primary-color;
      cursor: pointer;
    }

    .link-copied {
      color: $success-color;
    }

    .link-copied-error {
      color: $error-color;
    }
  }
}
</style>
