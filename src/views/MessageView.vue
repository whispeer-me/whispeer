<template>
  <div class="message">
    <ChiperDisplay v-if="message" :message="message" />
    <!-- <ChiperDisplay
      message="Hello World! Programming is awesome! Enjoy it while you can." -->
    />
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
import ChiperDisplay from "@/components/ChiperDisplay.vue";
import MessageService from "@/services/MessageService";

export default {
  name: "MessageView",
  components: {
    ChiperDisplay,
  },
  props: {
    messageId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      message: null,
      errorMessage: null,
    };
  },
  async mounted() {
    try {
      const data = await MessageService.getMessage(this.messageId);
      this.message = data.message;
    } catch (error) {
      console.error(error);
      this.errorMessage = "Failed to load message. Please try again later.";
    }
  },
  methods: {},
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 20px;
}
</style>
