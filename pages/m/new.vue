// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="create-message-view">
    <CommonError :error-message="errorMessage" />

    <div v-if="newMessage">
      <h1>New Message</h1>
      <p v-if="showTooltip" class="shortcut-hint">
        ⌨️ Press (CMD / Ctrl + Enter) to submit message
      </p>
      <form @submit.prevent="submitMessage" @keydown.meta.enter="submitMessage">
        <textarea
          v-model="message.content"
          class="new-message-textarea"
          placeholder="Type your message here ..."
          :maxlength="maxCharsAllowed"
          required
        />

        <p>
          Maximum characters allowed: {{ maxCharsAllowed }}. Every message is
          encrypted in your browser before it is sent.
        </p>

        <p v-if="shouldWarn" class="warning">
          {{ maxCharsAllowed - message.content.length }} characters left.
        </p>

        <div class="privacy-settings">
          <CommonSwitch
            class="passphrase-toggle"
            title="Add passphrase"
            :value="message.usePassphrase"
            @change="(value) => (message.usePassphrase = value)"
          />
          <CommonSwitch
            class="burn-toggle"
            title="Delete after first view"
            :value="message.burnAfterRead"
            @change="(value) => (message.burnAfterRead = value)"
          />
        </div>

        <div v-if="message.usePassphrase" class="passphrase">
          <input
            v-model="message.passphrase"
            class="new-message-passphrase-input"
            type="password"
            :placeholder="`Passphrase (at least ${minPassphraseLength} characters)`"
            :minlength="minPassphraseLength"
            autocomplete="new-password"
            @keydown.enter.prevent="submitMessage"
          >
          <p class="passphrase-warning">
            Share the passphrase separately: never in the same place as the
            message link.
          </p>
        </div>

        <div v-if="showDisclaimer" class="security-disclaimer">
          <p>
            Please note that while Whispeer encrypts every message in your
            browser, <br>
            <b>it has not been audited by experts, and it is not made by
              security experts. </b><br>
            It should not be solely relied upon for complete privacy or
            anonymity.
          </p>
        </div>

        <div class="submit-button">
          <button
            title="Submit (CMD / Ctrl + Enter)"
            type="submit"
            :disabled="requestProcessing"
          >
            Create Message
          </button>
        </div>
      </form>
    </div>
    <div v-if="messageLink && !newMessage" class="message-link">
      <p>
        Your encrypted message has been created. Click to copy the link and
        share it.
      </p>
      <p class="link-warning">
        Anyone with this link<span v-if="created.hasPassphrase"> and the passphrase</span>
        can read the message<span v-if="created.burnAfterRead">, once: it is deleted
          after the first view</span>. The key is the part after
        <b>#</b>; it never reaches our server, so a link without it cannot
        be opened.
      </p>

      <p title="Click to copy link">
        <a
          :href="messageLink"
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
      <button type="button" @click="composeNewMessage">
        New Message
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
const { trackPageView, trackEvent } = useAnalytics();

const minPassphraseLength = 8;

const message = ref({
  content: "",
  usePassphrase: false,
  passphrase: "",
  burnAfterRead: false,
});

// Flags of the last created message, for the link warning and analytics.
const created = ref({ hasPassphrase: false, burnAfterRead: false });

const newMessage = ref(true);
const messageLink = ref(null);
const errorMessage = ref(null);
const messageCopiedToClipboard = ref(false);
const messageCopiedToClipboardFailed = ref(false);
const maxCharsAllowed = ref(constants.MESSAGE_MAX_CHARS_ALLOWED);
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
        "Create encrypted, expiring messages with Whispeer. Every message is encrypted in your browser; the key stays in the link and never reaches the server.",
    },
    {
      name: "keywords",
      content:
        "Secure Messaging, Private Message Creation, Encrypted Communication, Confidential Messaging Platform, End-to-End Encryption, Whispeer Messaging Service, Online Safe Communication, Digital Privacy, Personal Data Security, Anonymous Messaging Tool, Burn After Reading, Temporary Messaging, Auto Expiring Message, Secure, Safe Messaging",
    },
  ],
});

const charsLeft = computed(() => {
  return maxCharsAllowed.value - message.value.content.length;
});

const shouldWarn = computed(() => {
  return charsLeft.value < warningCharsLeft.value;
});

onMounted(() => {
  maybeShowTooltip();
  maybeShowDisclaimer();
  trackPageView({ useRef: false });
});

const submitMessage = async () => {
  if (requestProcessing.value) {
    return;
  }
  resetErrorMessage();

  if (!isMessageValid()) {
    return;
  }

  requestProcessing.value = true;

  try {
    const options = {
      passphrase: message.value.usePassphrase
        ? message.value.passphrase
        : undefined,
      burnAfterRead: message.value.burnAfterRead,
    };
    const { linkKey, payload } = await cryptoService.encrypt(
      message.value.content,
      options,
    );
    const { id } = await messageService.createMessage(payload);
    handleSuccessfulSubmission(id, linkKey, payload);
  } catch (error) {
    handleError(error);
  } finally {
    requestProcessing.value = false;
  }
};

const isMessageValid = () => {
  return isContentValid() && isPassphraseValid();
};

const isContentValid = () => {
  if (message.value.content.trim().length === 0) {
    errorMessage.value = "Please type a message.";
    return false;
  }
  if (message.value.content.length > maxCharsAllowed.value) {
    errorMessage.value = `Message exceeds ${maxCharsAllowed.value} characters.`;
    return false;
  }
  return true;
};

const isPassphraseValid = () => {
  if (
    message.value.usePassphrase &&
    message.value.passphrase.length < minPassphraseLength
  ) {
    errorMessage.value = `Passphrase must be at least ${minPassphraseLength} characters.`;
    return false;
  }
  return true;
};

const resetErrorMessage = () => {
  errorMessage.value = null;
};

const handleSuccessfulSubmission = (id, linkKey, payload) => {
  if (!id) {
    errorMessage.value = "An unexpected error occurred";
    return;
  }
  messageLink.value = `${window.location.origin}/m/${id}#${linkKey}`;
  created.value = {
    hasPassphrase: payload.has_passphrase,
    burnAfterRead: payload.burn_after_read,
  };
  resetForm();
  logMessageCreation();
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

  // Toggles keep their state for the next message.
};

// Only booleans: never the link, key or message ID.
const logMessageCreation = () => {
  trackEvent("message-created", {
    props: {
      has_passphrase: created.value.hasPassphrase,
      burn_after_read: created.value.burnAfterRead,
    },
  });
};

const logNewMessageCreation = () => {
  trackEvent("create-message", { props: { source: "after-create" } });
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
  messageCopiedToClipboard.value = true;
  messageCopiedToClipboardFailed.value = false;
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
  messageLink.value = null;
  logNewMessageCreation();
};

const maybeShowTooltip = () => {
  if (
    preferenceService.shouldShow(
      constants.TOOLTIP_META_ENTER_KEY_VIEWS_COUNT,
      constants.TOOLTIP_META_ENTER_KEY_VIEWS_MAX_COUNT,
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
    false,
  );
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/new_message.scss";
</style>
