// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <form @submit.prevent="handleSubmit">
    <h3>Enter Passphrase</h3>
    <p>Please enter the passphrase to decrypt the message.</p>
    <input
      type="password"
      v-model="localPassphrase"
      placeholder="Enter the passphrase"
      class="input-style passphrase-input"
      required
    />
    <div class="modal-buttons">
      <button type="submit">Decrypt the message</button>
      <button type="button" @click="closeModal">Cancel</button>
    </div>
  </form>
</template>

<script setup>
const emit = defineEmits(["submit", "close"]);

const localPassphrase = ref("");

const handleSubmit = () => {
  if (localPassphrase.value) {
    emit("submit", localPassphrase.value);
  }
};

const closeModal = () => {
  emit("close");
};
</script>
