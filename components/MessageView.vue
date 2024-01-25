<template>
  <div class="message">
    <LoadingIndicator :isLoading="isLoading" />
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="message.content">
      <p class="expire-info">
        This message will expire in
        <span class="highlight">{{ message.expires_in }}</span>
      </p>
      <p class="view-count">
        View Count: <span class="highlight">{{ message.view_count + 1 }}</span>
      </p>
      <ChiperDisplay :message="message.content" class="chiper-display" />
    </div>

    <SimpleModal
      v-if="isModalVisible"
      @close="closeModal"
      class="passphrase-modal"
    >
      <template #default>
        <h3>Enter Passphrase</h3>
        <p>Please enter the passphrase to decrypt the message.</p>
        <input
          type="password"
          v-model="passphrase"
          placeholder="Enter the passphrase"
          class="input-style passphrase-input"
          required
        />
        <div class="modal-buttons">
          <button @click="onModalSubmit">Decrypt the message</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </template>
    </SimpleModal>
  </div>
</template>

<script setup lang="js">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const message = ref({
  content: null,
  view_count: 0,
  created_at: null,
  expires_in: null,
});

const errorMessage = ref(null);
const isLoading = ref(true);
const passphrase = ref("");
const isModalVisible = ref(false);

const config = useRuntimeConfig();

const fullImageUrl = `${config.app.analyticsDomain}/logo.png`;

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
      content: fullImageUrl,
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
  if (route.hash) {
    processHashChange(route.hash);
  }
});

const processHashChange = async (hash) => {
  message.content = null;
  const messageId = hash.substring(1); // Removes the '#' from the hash
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
        errorMessage.value = "No message content available for  decryption.";
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
  message.value.created_at = retrievedMessage.created_at;
  message.value.view_count = retrievedMessage.view_count || 0;
  message.value.expires_in = retrievedMessage.expires_in;

  if (retrievedMessage.is_private) {
    const passphrase = await showPassphraseModal();
    message.value.content = await decryptMessage(retrievedMessage, passphrase);
  } else {
    message.value.content = retrievedMessage.content;
  }
};

const decryptMessage = async (retrievedMessage, passphrase) => {
  try {
    const decryptedContent = cryptoService.decrypt(
      retrievedMessage.content,
      passphrase,
      retrievedMessage.salt,
      retrievedMessage.iv
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

const onModalSubmit = () => {
  if (passphrase) {
  }
  closeModal();
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";
@import "@/assets/scss/message.scss";
@import "@/assets/scss/modal.scss";
</style>
