<template>
  <div class="create-message-view">
    <h1>Create a New Message</h1>
    <form @submit.prevent="submitMessage">
      <textarea
        v-model="message.content"
        placeholder="Type your message here..."
        required
      ></textarea>

      <div class="privacy-settings">
        <ToggleSwitch
          title="Private Message"
          :value="message.isPrivate"
          @change="handleToggleChange"
        />
      </div>

      <div v-if="message.isPrivate" class="passphrase">
        <input
          class="passphrase-input"
          type="password"
          v-model="message.passphrase"
          placeholder="Enter a passphrase to encrypt"
          required
        />
      </div>

      <div class="submit-button">
        <button type="submit">Send Message</button>
      </div>
    </form>
  </div>
</template>

<script>
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

export default {
  name: "CreateMessageView",
  data() {
    return {
      message: {
        content: "",
        isPrivate: false,
        passphrase: "",
      },
    };
  },
  components: {
    ToggleSwitch,
  },
  methods: {
    async submitMessage() {
      this.$analytics.trackEvent("message-created", {
        props: {
          isPrivate: this.message.isPrivate,
        },
      });
      console.log("Message submitted:", this.message);
    },
    handleToggleChange(newValue) {
      this.message.isPrivate = newValue;
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

$border-radius: 5px;
$input-padding: 10px;

.create-message-view {
  text-align: center;

  h1 {
    color: $primary-color;
  }

  textarea {
    width: 80%;
    height: 100px;
    margin: 10px 0;
    padding: $input-padding;
    font-size: 1em;
    border-radius: $border-radius;
    border: 1px solid $primary-color;
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
    width: 80%;
    padding: $input-padding;
    font-size: 1em;
    border-radius: $border-radius;
    border: 1px solid $primary-color;
    margin-top: 20px;
  }

  .submit-button {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  button {
    @extend %button-style;
  }
}
</style>
