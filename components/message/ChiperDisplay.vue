// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div id="board" v-if="isBoardReady">
    <span
      class="char"
      v-for="(char, index) in characters"
      :class="char.class"
      :key="index"
      >{{ char.char }}</span
    >
  </div>
</template>

<script setup lang="js">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  message: {
    type: String,
    default: "",
  },
});

const characters = ref([]);
const asciiStart = 33;
const asciiEnd = 126;
const randomCharsCount = 2000;
const isBoardReady = ref(false);

let randomizer = null;

const getRandomInt = (min, max) => {
  min = Math.ceil(Math.max(0, min));
  max = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomChar = () =>
  String.fromCharCode(getRandomInt(asciiStart, asciiEnd));

const createRandomChars = () => {
  return Array.from({ length: randomCharsCount }, () => ({
    char: getRandomChar(),
    class: "",
    matched: false,
  }));
};

const display = () => {
  let charIndex = 0;
  characters.value.forEach((char, i) => {
    if (i < props.message.length) {
      char.matched = true;
      char.class = "matched";
      char.char = props.message[charIndex++];
    } else {
      char.class = "unmatched";
      char.matched = false;
    }
  });
};

const randomize = () => {
  characters.value = createRandomChars();
  isBoardReady.value = true;
};

onMounted(() => {
  const randomizeIntervalMs = 750;
  const displayStartDelayMs = 3000;

  randomizer = setInterval(randomize, randomizeIntervalMs);
  setTimeout(() => {
    clearInterval(randomizer);
    display();
  }, displayStartDelayMs);
});

onBeforeUnmount(() => {
  if (randomizer) {
    clearInterval(randomizer);
  }
});
</script>

<style lang="scss">
@import url("~/assets/scss/message.scss");
</style>
