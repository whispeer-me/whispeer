<template>
  <form @submit.prevent="handleSubmit">
    <h3>Enter Passphrase</h3>
    <p>Please enter the passphrase to decrypt the message.</p>
    <input
      type="password"
      :value="passphrase"
      @input="$emit('update:passphrase', $event.target.value)"
      placeholder="Enter the passphrase"
      class="input-style passphrase-input"
      required
    />

    <div class="modal-buttons">
      <button @click="onModalSubmit">Decrypt the message</button>
      <button @click="closeModal">Cancel</button>
    </div>
  </form>
</template>

<script setup>
const emit = defineEmits(["update:passphrase", "submit"]);

const props = defineProps({
  passphrase: String,
});

const handleSubmit = () => {
  emit("submit", props.passphrase);
};
</script>
