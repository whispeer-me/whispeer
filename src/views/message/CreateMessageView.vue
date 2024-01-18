<template>
  <div class="create-message-view">
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-if="newMessage">
      <h1>New Message</h1>
      <form @submit.prevent="submitMessage" @keydown.meta.enter="submitMessage">
        <textarea
          v-model="message.content"
          placeholder="Type your message here ..."
          :maxlength="maxCharsAllowed"
          required
          @keydown.tab="focusToPassphraseInput"
        ></textarea>

        <p>Maximum characters allowed: {{ maxCharsAllowed }}.</p>

        <p v-if="shouldWarn" class="warning">
          {{ this.maxCharsAllowed - this.message.content.length }} characters
          left.
        </p>

        <div class="privacy-settings">
          <ToggleSwitch
            title="Secure Message"
            :value="message.is_private"
            @change="handleToggleChange"
          />
        </div>

        <div v-if="message.is_private" class="passphrase">
          <input
            ref="passphraseInput"
            class="passphrase-input"
            type="password"
            v-model="message.passphrase"
            placeholder="Enter a passphrase to encrypt"
            required
            @keydown.enter="submitMessage"
          />
          <p class="passphrase-warning">
            Handle passphrase with care: never share it where the message link
            is visible.
          </p>
        </div>

        <div v-if="!messageLink" class="security-disclaimer">
          <p>
            Please note that while Whispeer provides enhanced encryption for
            messaging, <br />
            <b
              >it has not been audited by experts, and it is not made by
              security experts. </b
            ><br />
            It should not be solely relied upon for complete privacy or
            anonymity.
          </p>
        </div>

        <div class="submit-button">
          <button
            type="submit"
            ref="submitButton"
            :disabled="requestProcessing"
          >
            {{ submitButtonTitle }}
          </button>
        </div>
      </form>
    </div>
    <div v-if="messageLink && !newMessage" class="message-link">
      <p>
        Your
        <span class="highlight" v-if="message.is_private">secure </span> message
        has been created. Click to copy the link and safely share it with your
        friends.
      </p>

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
    <div v-if="!newMessage" class="submit-button new-message">
      <button type="button" @click="composeNewMessage">New Message</button>
    </div>
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
        is_private: false,
        passphrase: "",
      },
      newMessage: true,
      messageLink: null,
      errorMessage: null,
      messageCopiedToClipboard: false,
      messageCopiedToClipboardFailed: false,
      maxCharsAllowed: 256,
      warningCharsLeft: 20,
      requestProcessing: false,
    };
  },
  metaInfo() {
    return {
      title: "Whispeer - Create New Message",
      meta: [
        {
          vmid: "description",
          name: "description",
          content:
            "Create new secure and private messages with Whispeer. Our platform offers end-to-end encryption for confidential, private communication.",
        },
        {
          vmid: "keywords",
          name: "keywords",
          content:
            "Secure Messaging, Private Message Creation, Encrypted Communication, Confidential Messaging Platform, End-to-End Encryption, Whispeer Messaging Service, Safe Online Communication, Private Chat Application, Digital Privacy, Personal Data Security, Anonymous Messaging Tool, Vue.js Encrypted Chat, Protecting Conversations Online, Cybersecurity in Messaging",
        },
      ],
    };
  },

  computed: {
    charsLeft() {
      return this.maxCharsAllowed - this.message.content.length;
    },
    shouldWarn() {
      return this.charsLeft < this.warningCharsLeft;
    },
    submitButtonTitle() {
      return this.message.is_private
        ? "Create Secure Message"
        : "Create Message";
    },
  },
  methods: {
    async submitMessage() {
      if (this.message.content.length > this.maxCharsAllowed) {
        this.errorMessage = `Message exceeds ${this.maxCharsAllowed} characters.`;
        return;
      }

      if (this.message.is_private && !this.message.passphrase) {
        this.focusToPassphraseInput();
        return;
      }

      this.errorMessage = "";
      let newMessage;
      this.requestProcessing = true;

      try {
        newMessage = this.prepareAndMaybeEncryptTheMessage();
      } catch (error) {
        this.handleError(error, "Error occured during message encryption.");
        return;
      }

      try {
        const newlyCreatedMessage = await MessageService.createMessage(
          newMessage
        );
        this.handleSuccessfulSubmission(newlyCreatedMessage);
      } catch (error) {
        this.handleError(
          error,
          "Error occured while submitting the message to the server. Please try again."
        );
      } finally {
        this.requestProcessing = false;
      }
    },

    prepareAndMaybeEncryptTheMessage() {
      let newMessage = {
        content: this.message.content,
        is_private: this.message.is_private,
      };

      if (this.message.is_private && this.message.passphrase) {
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
        this.messageLink = `${window.location.origin}/m/#${newlyCreatedMessage.id}`;
        this.resetForm();
        this.logAnalytics();
      }
    },

    handleError(error, info) {
      this.errorMessage =
        error.response?.data?.data?.message ||
        info ||
        "An unexpected error occurred";
    },

    resetForm() {
      this.errorMessage = null;
      this.message.content = "";
      this.message.passphrase = "";
      this.newMessage = false;

      // Due to Toggle Switch problem let's not change the state of the switch
    },

    handleToggleChange(newValue) {
      this.message.is_private = newValue;
    },

    logAnalytics() {
      this.$analytics.trackEvent("message-created", {
        props: { is_private: this.message.is_private },
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

    composeNewMessage() {
      this.newMessage = true;
    },

    focusToPassphraseInput(e) {
      e.preventDefault();
      if (this.message.is_private) {
        this.$refs.passphraseInput.focus();
      } else {
        this.$refs.submitButton.focus();
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

.create-message-view {
  text-align: center;

  textarea {
    @extend %textarea-style;
    width: 80%;
    height: 100px;
    margin: 10px 0;
    padding: $input-padding;
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
    @extend %input-style;
    width: 80%;
    margin-top: 20px;
    padding: 10px;
  }

  .submit-button {
    display: flex;
    justify-content: center;
    margin-top: 20px;

    button {
      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    }
  }

  .new-message {
    margin-top: 40px;
  }

  .security-disclaimer {
    font-family: $secondary-font;
    color: $secondary-color;
    margin: 16px;
    line-height: 1.5;
  }

  .passphrase-warning {
    color: $warning-color;
    margin-top: 10px;
    font-family: $secondary-font;
  }

  .message-link {
    font-family: $secondary-font;
    color: $secondary-color;
    margin-top: 20px;
    min-height: 100px;

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
