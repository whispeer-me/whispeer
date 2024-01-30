<template>
  <div class="create-message-view">
    <CommonError :errorMessage="errorMessage" />

    <div v-if="newMessage">
      <h1>New Message</h1>
      <p v-if="showTooltip" class="shortcut-hint">
        ⌨️ Press (CMD / Ctrl + Enter) to submit message
      </p>
      <form @submit.prevent="submitMessage" @keydown.meta.enter="submitMessage">
        <textarea
          class="new-message-textarea"
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
          <CommonSwitch
            title="Secure Message"
            :value="message.is_private"
            @change="handleToggleChange"
          />
        </div>

        <div v-if="message.is_private" class="passphrase">
          <input
            ref="passphraseInput"
            class="new-message-passphrase-input"
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

<script setup>
import { ref, onMounted, computed } from "vue";

const message = ref({
  content: "",
  is_private: false,
  passphrase: "",
});

const newMessage = ref(true);
const messageLink = ref(null);
const errorMessage = ref(null);
const messageCopiedToClipboard = ref(false);
const messageCopiedToClipboardFailed = ref(false);
const maxCharsAllowed = ref(256);
const warningCharsLeft = ref(20);
const requestProcessing = ref(false);
const showTooltip = ref(false);
const showDisclaimer = ref(false);

useHead({
  title: "Whispeer - Create New Message",
  meta: [
    {
      name: "description",
      content:
        "Create new secure and private messages with Whispeer. Our platform offers end-to-end encryption for confidential, private communication.",
    },
    {
      name: "keywords",
      content:
        "Secure Messaging, Private Message Creation, Encrypted Communication, Confidential Messaging Platform, End-to-End Encryption, Whispeer Messaging Service, Safe Online Communication, Private Chat Application, Digital Privacy, Personal Data Security, Anonymous Messaging Tool, Vue.js Encrypted Chat, Protecting Conversations Online, Cybersecurity in Messaging",
    },
  ],
});

const charsLeft = computed(() => {
  return maxCharsAllowed.value - message.value.content.length;
});

const shouldWarn = computed(() => {
  return charsLeft < warningCharsLeft.value;
});

const submitButtonTitle = computed(() => {
  return message.value.is_private ? "Create Secure Message" : "Create Message";
});

onMounted(() => {
  maybeShowTooltip();
  maybeShowDisclaimer();
});

const submitMessage = async () => {
  resetErrorMessage();

  if (!isMessageValid()) {
    return;
  }

  requestProcessing.value = true;

  try {
    const newMessage = prepareAndMaybeEncryptTheMessage();
    const newlyCreatedMessage = await messageService.createMessage(newMessage);
    handleSuccessfulSubmission(newlyCreatedMessage);
  } catch (error) {
    handleError(error);
  } finally {
    requestProcessing.value = false;
  }
};

const isMessageValid = () => {
  return isLengthValid() && isPassphraseValidIfPrivate();
};

const isLengthValid = () => {
  if (message.content.value.length > maxCharsAllowed) {
    errorMessage.value = `Message exceeds ${maxCharsAllowed} characters.`;
    return false;
  }
  return true;
};

const isPassphraseValidIfPrivate = () => {
  if (message.value.is_private && !message.value.passphrase) {
    focusToPassphraseInput();
    return false;
  }
  return true;
};

const resetErrorMessage = () => {
  errorMessage.value = null;
};

const prepareAndMaybeEncryptTheMessage = () => {
  let newMessage = {
    content: message.value.value.content,
    is_private: message.value.value.is_private,
  };

  if (message.value.is_private && message.value.passphrase) {
    const encryptedMessage = cryptoService.encrypt(
      message.value.content,
      message.value.passphrase
    );

    newMessage.content = encryptedMessage.ciphertext;
    newMessage.iv = encryptedMessage.iv;
    newMessage.salt = encryptedMessage.salt;
  }

  return newMessage;
};

const handleSuccessfulSubmission = (newlyCreatedMessage) => {
  if (newlyCreatedMessage.id) {
    messageLink.value = `${window.location.origin}/m/#${newlyCreatedMessage.id}`;
    resetForm();
    logMessageCreation();
  }
};

const handleError = (error) => {
  const defaultErrorMessage = "An unexpected error occurred";
  errorMessage.value = error.message || defaultErrorMessage;
};

const resetForm = () => {
  errorMessage.value = null;
  message.value.content = "";
  message.value.passphrase = "";
  newMessage.value = false;

  // Due to Toggle Switch problem let's not change the state of the switch
};

const handleToggleChange = (newValue) => {
  message.value.is_private = newValue;
};

const logMessageCreation = () => {
  // TODO: Fix here after integrate analytics
  // this.$analytics.trackEvent("message-created", {
  //   props: { is_private: this.message.is_private },
  // });
};

const logNewMessageCreation = () => {
  // TODO: Fix here after integrate analytics 2
  // this.$analytics.trackEvent("new-message");
};

const copyLinkToClipboard = () => {
  if (!navigator.clipboard) {
    handleClipboardFailure();
    return;
  }

  navigator.clipboard
    .writeText(messageLink.value)
    .then(handleClipboardSuccess)
    .catch(handleClipboardFailure);
};

const handleClipboardSuccess = () => {
  messageCopiedToClipboard = true;
  messageCopiedToClipboardFailed = false;
  setTimeout(resetClipboardState, constants.CLIPBOARD_INFORM_MESSAGE_DURATION);
};

const handleClipboardFailure = () => {
  messageCopiedToClipboardFailed.value = true;
};

const resetClipboardState = () => {
  messageCopiedToClipboard.value = false;
};

const composeNewMessage = () => {
  newMessage.value = true;
  logNewMessageCreation();
};

const focusToPassphraseInput = (e) => {
  e.preventDefault();
  if (message.value.is_private) {
    this.$refs.passphraseInput.focus();
  } else {
    this.$refs.submitButton.focus();
  }
};

const maybeShowTooltip = () => {
  if (
    preferenceService.shouldShow(
      constants.TOOLTIP_META_ENTER_KEY_VIEWS_COUNT,
      constants.TOOLTIP_META_ENTER_KEY_VIEWS_MAX_COUNT
    )
  ) {
    showTooltip.value = true;
    hideTooltip();
  }
};

const hideTooltip = () => {
  setTimeout(() => {
    showTooltip.value = false;
  }, 10000);
};

const maybeShowDisclaimer = () => {
  showDisclaimer.value = preferenceService.shouldShow(
    constants.DISCLAIMER_VIEWS_COUNT,
    constants.DISCLAIMER_VIEWS_MAX_COUNT,
    false
  );
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/new_message.scss";
</style>
