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
      v-if="payload?.has_passphrase && content === null && !isModalVisible"
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
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { isValidLinkKey } from "~/composables/crypto.service";
const { trackPageView, trackEventClean } = useAnalytics();

const INCOMPLETE_LINK_ERROR =
  "This link is incomplete: the key after # is missing, so the message can not be decrypted. If you already opened this page, open the original link again.";
const DAMAGED_LINK_ERROR =
  "This link is damaged: the key after # is not complete, so the message can not be decrypted. Copy the whole original link and open it again. The message has not been opened.";

const route = useRoute();
const router = useRouter();

// The link key lives only in this closure: never in reactive state, the
// address bar, history or the router.
let linkKey = null;
// Last key taken from the URL (dedupes the two listeners for one navigation).
let takenKey = null;

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
  logPageView();
  window.addEventListener("hashchange", onUrlChange);
  await loadFromUrl(true);
});

onBeforeUnmount(() => {
  window.removeEventListener("hashchange", onUrlChange);
});

// Pasting the link again into this tab is a same-document fragment
// navigation: no reload, no remount. Catch it from both sides.
watch(() => route.hash, (hash) => {
  if (hash) { onUrlChange(); }
});

const onUrlChange = () => loadFromUrl(false);

const loadFromUrl = async (initial) => {
  const key = await takeKeyFromUrl();

  if (key === null) {
    if (initial) {
      errorMessage.value = INCOMPLETE_LINK_ERROR;
      isLoading.value = false;
    }
    return;
  }
  // hashchange and the route watcher both fire for one navigation.
  if (key === takenKey) {
    return;
  }
  takenKey = key;

  // Check the key before anything irreversible: a damaged link must not
  // burn a message it can never decrypt.
  if (!isValidLinkKey(key)) {
    resetView();
    errorMessage.value = DAMAGED_LINK_ERROR;
    isLoading.value = false;
    return;
  }

  resetView();
  linkKey = key;
  await fetchTheMessage(route.params.id);
};

const resetView = () => {
  linkKey = null;
  payload.value = null;
  content.value = null;
  isBurnReady.value = false;
  isModalVisible.value = false;
  passphraseError.value = null;
  errorMessage.value = null;
};

// Reads the key from the fragment, then drops it from the address bar,
// history.state and the router state so it is not left behind on this device.
const takeKeyFromUrl = async () => {
  const key = window.location.hash.slice(1) || route.hash.slice(1);
  if (!key) {
    return null;
  }

  // Synchronously first, so a second listener for the same navigation finds
  // no hash in the address bar.
  const clean = window.location.pathname + window.location.search;
  window.history.replaceState(scrubState(window.history.state, key), "", clean);

  // vue-router keeps its own copy (history.state.current, route.hash) and
  // would write it back on the next navigation: replace through the router.
  if (route.hash) {
    await router.replace({ path: route.path, query: route.query, hash: "" });
  }
  if (JSON.stringify(window.history.state ?? null).includes(key)) {
    window.history.replaceState(scrubState(window.history.state, key), "", clean);
  }
  return key;
};

// Copy of a history state object with every "#<key>" removed from its strings.
const scrubState = (state, key) => {
  if (state === null || typeof state !== "object") {
    return state;
  }
  const out = {};
  for (const [k, v] of Object.entries(state)) {
    out[k] = typeof v === "string" ? v.split(`#${key}`).join("").split(key).join("") : v;
  }
  return out;
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
