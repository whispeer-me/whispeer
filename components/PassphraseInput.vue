<template>
  <form @submit.prevent="handleSubmit">
    <input
      type="password"
      :value="passphrase"
      @input="$emit('update:passphrase', $event.target.value)"
      placeholder="Enter the passphrase"
      class="input-style passphrase-input"
      required
    />
    <button type="submit">Decrypt the message</button>
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
