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
        <span>Private Message:</span>
        <label class="switch">
          <input
            type="checkbox"
            id="privateToggle"
            v-model="message.isPrivate"
          />
          <span class="slider round"></span>
        </label>
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
  methods: {
    async submitMessage() {
      this.$analytics.trackEvent("message-created", {
        props: {
          isPrivate: this.message.isPrivate,
        },
      });
      console.log("Message submitted:", this.message);
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/app.scss";

$border-radius: 5px;
$input-padding: 10px;
$color-on: $primary-color;
$color-off: #ccc;

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

    .switch {
      position: relative;
      display: inline-block;
      width: 70px;
      height: 34px;
      margin-right: 10px;

      & input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: $color-off; // Off color
        transition: 0.4s;
        border-radius: 34px;

        &:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }
      }

      input:checked + .slider {
        background-color: $color-on; // On color
      }

      input:focus + .slider {
        box-shadow: 0 0 1px $color-on; // On color
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      &.round {
        border-radius: 34px;

        .slider:before {
          border-radius: 50%;
        }
      }
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
    background-color: $primary-color;
    color: white;
    padding: $input-padding 20px;
    border: none;
    border-radius: $border-radius;
    cursor: pointer;
    font-size: 1em;
    margin-top: 20px;

    &:hover {
      background-color: $hover-color;
    }
  }
}
</style>
