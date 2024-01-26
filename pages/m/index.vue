<template>
  <div class="message">
    <LoadingIndicator :isLoading="isLoading" />
    <Error :errorMessage="!message.is_private && errorMessage" />

    <div v-if="message.content">
      <MessageInfo :message="message" />
      <ChiperDisplay :message="message.content" class="chiper-display" />
    </div>

    <SimpleModal :isVisible="isModalVisible" class="passphrase-modal">
      <Error :errorMessage="message.is_private && errorMessage" />
      <PassphraseInput @close="closeModal" @submit="onModalSubmit" />
    </SimpleModal>
  </div>
</template>

<script setup lang="js">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const message = ref({
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
const ogImageUrl = `${config.app.analyticsDomain}/logo.png`;
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

watch(
  () => route.hash,
  (newHash) => {
    processHashChange(newHash);
  }
);

onMounted(() => {
  if (route.hash !== undefined) {
    processHashChange(route.hash);
  }
});

const processHashChange = async (hash) => {
  message.value.content = null;
  const messageId = hash.substring(1); // Remove the '#' from the hash
  if (messageId) {
    await fetchTheMessage(messageId);
  } else {
    errorMessage.value =
      "No message ID provided in the url. Please ensure the url includes # followed by the message ID";
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
  }
};

const extractMessage = (retrievedMessage) => {
  Object.assign(message.value, {
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

const decryptMessage = async (passphrase) => {
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
  const decryptedContent = await decryptMessage(submittedPassphrase);
  if (decryptedContent) {
    message.value.content = decryptedContent;
    closeModal();
  }
};
</script>

<style lang="scss">
@import "@/assets/scss/message.scss";
@import "@/assets/scss/modal.scss";
</style>
