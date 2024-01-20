<template>
  <div class="create-message-view">
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-if="newMessage">
      <h1>New Message</h1>
      <p v-if="showTooltip" class="shortcut-hint">
        ⌨️ Press (CMD / Ctrl + Enter) to submit message
      </p>
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
            Handle passphrase with care: Never share it where the message link
            is visible.
          </p>
        </div>

        <div v-if="showDisclaimer" class="security-disclaimer">
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
            title="Submit (CMD / Ctrl + Enter)"
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

      <p title="Click to copy link">
        <a
          href="messageLink"
          class="copyable-link"
          @click.prevent="copyLinkToClipboard"
          @keyup.enter="copyLinkToClipboard"
        >
          {{ messageLink }}
        </a>
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
import PreferencesService from "@/services/PreferenceService";
import * as Constants from "@/utils/constants";

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
      showTooltip: false,
      showDisclaimer: false,
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
  mounted() {
    this.maybeShowTooltip();
    this.maybeShowDisclaimer();
  },
  methods: {
    async submitMessage() {
      this.resetErrorMessage();

      if (!this.isMessageValid()) {
        return;
      }

      this.requestProcessing = true;

      try {
        const newMessage = this.prepareAndMaybeEncryptTheMessage();
        const newlyCreatedMessage = await MessageService.createMessage(
          newMessage
        );
        this.handleSuccessfulSubmission(newlyCreatedMessage);
      } catch (error) {
        this.handleError(error);
      } finally {
        this.requestProcessing = false;
      }
    },

    isMessageValid() {
      return this.isLengthValid() && this.isPassphraseValidIfPrivate();
    },

    isLengthValid() {
      if (this.message.content.length > this.maxCharsAllowed) {
        this.errorMessage = `Message exceeds ${this.maxCharsAllowed} characters.`;
        return false;
      }
      return true;
    },

    isPassphraseValidIfPrivate() {
      if (this.message.is_private && !this.message.passphrase) {
        this.focusToPassphraseInput();
        return false;
      }
      return true;
    },
    resetErrorMessage() {
      this.errorMessage = null;
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
        this.logMessageCreation();
      }
    },

    handleError(error) {
      const defaultErrorMessage = "An unexpected error occurred";
      this.errorMessage = error.message || defaultErrorMessage;
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

    logMessageCreation() {
      this.$analytics.trackEvent("message-created", {
        props: { is_private: this.message.is_private },
      });
    },

    logNewMessageCreation() {
      this.$analytics.trackEvent("new-message");
    },

    copyLinkToClipboard() {
      if (!navigator.clipboard) {
        this.handleClipboardFailure();
        return;
      }

      navigator.clipboard
        .writeText(this.messageLink)
        .then(this.handleClipboardSuccess)
        .catch(this.handleClipboardFailure);
    },

    handleClipboardSuccess() {
      this.messageCopiedToClipboard = true;
      this.messageCopiedToClipboardFailed = false;
      setTimeout(
        this.resetClipboardState,
        Constants.CLIPBOARD_INFORM_MESSAGE_DURATION
      );
    },

    handleClipboardFailure() {
      this.messageCopiedToClipboardFailed = true;
    },

    resetClipboardState() {
      this.messageCopiedToClipboard = false;
    },

    composeNewMessage() {
      this.newMessage = true;
      this.logNewMessageCreation();
    },

    focusToPassphraseInput(e) {
      e.preventDefault();
      if (this.message.is_private) {
        this.$refs.passphraseInput.focus();
      } else {
        this.$refs.submitButton.focus();
      }
    },

    maybeShowTooltip() {
      if (
        PreferencesService.shouldShow(
          Constants.TOOLTIP_META_ENTER_KEY_VIEWS_COUNT,
          Constants.TOOLTIP_META_ENTER_KEY_VIEWS_MAX_COUNT
        )
      ) {
        this.showTooltip = true;
        this.hideTooltip();
      }
    },

    hideTooltip() {
      setTimeout(() => {
        this.showTooltip = false;
      }, 10000);
    },

    maybeShowDisclaimer() {
      this.showDisclaimer = PreferencesService.shouldShow(
        Constants.DISCLAIMER_VIEWS_COUNT,
        Constants.DISCLAIMER_VIEWS_MAX_COUNT,
        false
      );
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

  .shortcut-hint {
    font-size: small;
    font-family: $secondary-font;
    color: $secondary-color;
    font-style: italic;
  }
}
</style>
