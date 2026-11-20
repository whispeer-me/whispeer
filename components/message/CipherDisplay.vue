// SPDX-License-Identifier: AGPL-3.0-only

<template>
  <div v-if="isBoardReady" id="board">
    <span
      v-for="(char, index) in characters"
      :key="index"
      class="char"
      :class="char.class"
    >{{ char.char }}</span>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createRandomChars } from "~/composables/cipher/random.chars";

const props = defineProps({
  message: {
    type: String,
    default: "",
  },
});

const characters = ref([]);
const isBoardReady = ref(false);

let randomizer = null;

// Split into user-perceived characters (graphemes), not UTF-16 code units:
// indexing a string splits emoji into lone surrogates that render invisible.
const toGraphemes = (text) => {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter().segment(text), s => s.segment);
  }
  return Array.from(text);
};

const display = () => {
  const graphemes = toGraphemes(props.message);
  characters.value.forEach((char, i) => {
    if (i < graphemes.length) {
      char.matched = true;
      char.class = "matched";
      char.char = graphemes[i];
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
