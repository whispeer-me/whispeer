// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="message">
    <CommonLoadingIndicator :isLoading="isLoading" />
    <CommonError :errorMessage="!message.is_private && errorMessage" />

    <div v-if="message.content">
      <MessageInfo :message="message" />
      <MessageCipherDisplay :message="message.content" class="chiper-display" />
    </div>

    <LazyCommonModal :isVisible="isModalVisible" class="passphrase-modal">
      <CommonError :errorMessage="message.is_private && errorMessage" />
      <MessagePassphraseInput @close="closeModal" @submit="onModalSubmit" />
    </LazyCommonModal>
  </div>
</template>

<script setup lang="js">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
const { trackPageView, trackEventClean } = useAnalytics();

const route = useRoute();

const message = ref({
  id: "",
  is_private: false,
  encryptedContent: null,
  salt: null,
  iv: null,
  content: null,
  view_count: 0,
  created_at: null,
  expires_in: null,
});

const errorMessage = ref(null);
const isLoading = ref(true);
const isModalVisible = ref(false);
const config = useRuntimeConfig();
const ogImageUrl = `https://${config.public.domain}/logo.png`;
const pageTitle = "Whispeer - Private Message";

useHead({
  title: pageTitle,
  meta: [
    {
      name: "og:description",
      content:
        "Someone has sent you a private message on Whispeer and it will expire in 24 hours.",
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

onMounted(() => {
  logPageView();
});

const processIdChange = async (messageId) => {
  message.value.content = null;
  if (messageId) {
    await fetchTheMessage(messageId);
  } else {
    errorMessage.value =
      "No message ID provided in the url. Please ensure the url includes message ID. ex: m/id";
  }
};

const fetchTheMessage = async (messageId) => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const { data: fetchedMessage } = await messageService.getMessage(messageId);

    if (!fetchedMessage) {
      errorMessage.value = "No message data received.";

      return;
    }

    if (!fetchedMessage.content) {
      if (fetchedMessage.is_private) {
        errorMessage.value = "No message content available for decryption.";
      } else {
        errorMessage.value = "No message content available to display";
      }

      return;
    }

    handleMessageRetrieval(fetchedMessage);
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
  }
};

const handleMessageRetrieval = async (retrievedMessage) => {
  extractMessage(retrievedMessage);

  if (retrievedMessage.is_private) {
    showModal();
  } else {
    await increaseViewCountAndLogAnalytics(retrievedMessage.id);
  }
};

const increaseViewCountAndLogAnalytics = async (id) => {
  try {
    await messageService.increaseViewCount(id);
  } catch (error) {
    handleError(error);
  } finally {
    logAnalytics();
  }
};

const handleError = (error) => {
  errorMessage.value = error.message;
};

const extractMessage = (retrievedMessage) => {
  Object.assign(message.value, {
    id: retrievedMessage.id,
    created_at: retrievedMessage.created_at,
    view_count: retrievedMessage.view_count || 0,
    expires_in: retrievedMessage.expires_in,
    is_private: retrievedMessage.is_private,
    salt: retrievedMessage.salt || null,
    iv: retrievedMessage.iv || null,
    content:
      retrievedMessage.is_private === false ? retrievedMessage.content : null,
    encryptedContent: retrievedMessage.is_private
      ? retrievedMessage.content
      : null,
  });
};

const decryptMessage = (passphrase) => {
  try {
    const decryptedContent = cryptoService.decrypt(
      message.value.encryptedContent,
      message.value.salt,
      message.value.iv,
      passphrase
    );
    return decryptedContent;
  } catch (error) {
    errorMessage.value = "Decryption failed. Please check the passphrase.";
  }
};

const showModal = () => {
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const onModalSubmit = async (submittedPassphrase) => {
  const decryptedContent = decryptMessage(submittedPassphrase);
  if (decryptedContent) {
    message.value.content = decryptedContent;
    closeModal();
    await increaseViewCountAndLogAnalytics(message.value.id);
  }
};

const logPageView = () => {
  trackPageView({ useRef: false });
};

const logAnalytics = () => {
  trackEventClean("message-viewed",
    {
      props: {
        is_private: message.value.is_private
      },
    }
  );
}

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await processIdChange(newId);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
@import "@/assets/scss/message.scss";
@import "@/assets/scss/modal.scss";
</style>
