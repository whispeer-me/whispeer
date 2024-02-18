<template>
  <div :class="['message-item', { 'is-animating': isAnimating }]">
    {{ displayMessage }}
  </div>
</template>

<script setup lang="ts">
import useAnimatedMessage from "@/composables/cipher/animate";

const props = defineProps({
  message: String,
  animationDuration: {
    type: Number,
    default: 500,
  },
});

const { displayMessage, isAnimating } = useAnimatedMessage(
  props.message,
  props.animationDuration
);
</script>

<style scoped lang="scss">
.message-item.is-animating {
  opacity: 0.8;
}
</style>
