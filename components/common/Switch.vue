// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div class="toggle-switch">
    <span>{{ title }}</span>
    <label class="switch">
      <input
        type="checkbox"
        :checked="value"
        @change="onChange($event.target.checked)"
      >
      <span class="slider round" />
    </label>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Toggle",
  },
  value: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change"]);

const checked = ref(props.value);

watchEffect(() => {
  checked.value = props.value;
});

const onChange = (newValue) => {
  emit("change", newValue);
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/components.scss";
</style>
