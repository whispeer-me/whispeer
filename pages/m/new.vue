<template>
  <div>
    <button @click="isModalVisible = !isModalVisible">Toggle Modal</button>
    <h1>Create Message</h1>
    <SimpleModal :isVisible="isModalVisible">
      <PassphraseInput />
    </SimpleModal>
  </div>
</template>

<script setup>
const isModalVisible = ref(false);
</script>
