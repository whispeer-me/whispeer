// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="message">
    <CommonLoadingIndicator :is-loading="isLoading" />
    <CommonError :error-message="errorMessage" />

    <div v-if="isBurnReady" class="burn-notice">
      <p class="expire-info">
        This message will be deleted after you open it. You can read it only
        once.
      </p>
      <div class="submit-button">
        <button
          type="button"
          class="open-burn-message"
          :disabled="isOpening"
          @click="openBurnMessage"
        >
          Open
        </button>
      </div>
    </div>

    <div
      v-if="payload && content === null && !isModalVisible"
      class="submit-button"
    >
      <button type="button" class="enter-passphrase" @click="showModal">
        Enter passphrase
      </button>
    </div>

    <div v-if="content !== null">
      <MessageInfo v-if="!info.burn_after_read" :message="info" />
      <p v-else class="expire-info">
        This message has been deleted from the server and can not be opened
        again.
      </p>
      <MessageCipherDisplay :message="content" class="chiper-display" />
    </div>

    <LazyCommonModal :is-visible="isModalVisible" class="passphrase-modal">
      <CommonError :error-message="passphraseError" />
      <MessagePassphraseInput @close="closeModal" @submit="onPassphraseSubmit" />
    </LazyCommonModal>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
const { trackPageView, trackEventClean } = useAnalytics();

const INCOMPLETE_LINK_ERROR =
  "This link is incomplete: the key after # is missing, so the message can not be decrypted. If you already opened this page, open the original link again.";

const route = useRoute();

// The link key lives only in this closure: never in reactive state, the
// address bar or history.
let linkKey = null;

const info = ref({
  id: "",
  has_passphrase: false,
  burn_after_read: false,
  view_count: 0,
  expires_in: null,
});
// Encrypted payload kept in memory so a wrong passphrase can be retried
// without asking the server again (a burn message exists there only once).
const payload = ref(null);
const content = ref(null);

const errorMessage = ref(null);
const passphraseError = ref(null);
const isLoading = ref(true);
const isModalVisible = ref(false);
const isBurnReady = ref(false);
const isOpening = ref(false);
const isDecrypting = ref(false);

const config = useRuntimeConfig();
const ogImageUrl = `https://${config.public.domain}/logo.png`;
const pageTitle = "Whispeer - Private Message";

useHead({
  title: pageTitle,
  meta: [
    {
      name: "og:description",
      content:
        "Someone has sent you an encrypted message on Whispeer. It expires within 24 hours.",
    },
    {
      name: "og:title",
      content: pageTitle,
    },
    {
      property: "og:image",
      content: ogImageUrl,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
  ],
});

onMounted(async () => {
  linkKey = takeKeyFromUrl();
  logPageView();

  if (!linkKey) {
    errorMessage.value = INCOMPLETE_LINK_ERROR;
    isLoading.value = false;
    return;
  }

  await fetchTheMessage(route.params.id);
});

// Reads the key from the fragment, then drops the fragment from the address
// bar and history so it is not left behind on this device.
const takeKeyFromUrl = () => {
  const key = window.location.hash.slice(1);
  if (window.location.hash) {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
  }
  return key || null;
};

const fetchTheMessage = async (messageId) => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const { data } = await messageService.getMessage(messageId);

    if (!data) {
      errorMessage.value = "No message data received.";
      return;
    }

    info.value = {
      id: data.id,
      has_passphrase: data.has_passphrase,
      burn_after_read: data.burn_after_read,
      view_count: data.view_count || 0,
      expires_in: data.expires_in,
    };

    if (data.burn_after_read) {
      isBurnReady.value = true;
      return;
    }

    await receivePayload(data);
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
  }
};

const openBurnMessage = async () => {
  if (isOpening.value) {
    return;
  }
  isOpening.value = true;
  errorMessage.value = null;
  try {
    const { data } = await messageService.openMessage(info.value.id);
    isBurnReady.value = false;
    await receivePayload(data);
  } catch (error) {
    isBurnReady.value = false;
    handleError(error);
  } finally {
    isOpening.value = false;
  }
};

const receivePayload = async (data) => {
  payload.value = {
    version: data.version,
    content: data.content,
    salt: data.salt,
    iv: data.iv,
    has_passphrase: data.has_passphrase,
    burn_after_read: info.value.burn_after_read,
  };

  if (payload.value.has_passphrase) {
    showModal();
  } else {
    await decryptMessage();
  }
};

const decryptMessage = async (passphrase) => {
  if (isDecrypting.value) {
    return;
  }
  isDecrypting.value = true;
  passphraseError.value = null;
  try {
    content.value = await cryptoService.decrypt(
      payload.value,
      linkKey,
      passphrase,
    );
  } catch {
    if (payload.value.has_passphrase) {
      passphraseError.value =
        "Wrong passphrase (or a damaged link). Please try again.";
    } else {
      errorMessage.value =
        "This message can not be decrypted: the link is damaged or incomplete.";
    }
    return;
  } finally {
    isDecrypting.value = false;
  }

  closeModal();
  await onDecrypted();
};

const onDecrypted = async () => {
  if (!info.value.burn_after_read) {
    try {
      await messageService.increaseViewCount(info.value.id);
    } catch {
      // View count is cosmetic; the message is already shown.
    }
  }
  logAnalytics();
};

const handleError = (error) => {
  errorMessage.value = error.message || "An unexpected error occurred";
};

const showModal = () => {
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const onPassphraseSubmit = async (submittedPassphrase) => {
  await decryptMessage(submittedPassphrase);
};

const logPageView = () => {
  trackPageView({ useRef: false });
};

// Only booleans: never the URL hash or message ID.
const logAnalytics = () => {
  trackEventClean("message-viewed", {
    props: {
      has_passphrase: info.value.has_passphrase,
      burn_after_read: info.value.burn_after_read,
    },
  });
};
</script>

<style lang="scss">
@import "@/assets/scss/message.scss";
@import "@/assets/scss/modal.scss";
</style>
