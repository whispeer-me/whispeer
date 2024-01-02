<template>
  <div class="message">
    <ChiperDisplay v-if="message" :message="message" />
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
import ChiperDisplay from "@/components/message/ChiperDisplay.vue";
import MessageService from "@/services/MessageService";

export default {
  name: "MessageView",
  components: {
    ChiperDisplay,
  },
  props: {
    id: {
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
    await this.getTheMessage();
  },
  methods: {
    async getTheMessage() {
      try {
        const data = await MessageService.getMessage(this.id);
        console.log(data);
        this.message = data.data.content;
      } catch (error) {
        console.error(error);
        this.errorMessage = "Failed to load message. Please try again later.";
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";
</style>
