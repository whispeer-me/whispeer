<template>
  <div id="board" v-if="isBoardReady">
    <span
      class="char"
      v-for="(char, index) in characters"
      :class="char.class"
      :key="index"
      :ref="index"
    >
      {{ char.char }}
    </span>
  </div>
  <div v-else class="loading-indicator">{{ loadingText }}</div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      characters: [],
      asciiStart: 33,
      asciiEnd: 126,
      randomLocation: 0,
      startMatching: false,
      isBoardReady: false,
      loadingText: "L o a d i n g . . .",
    };
  },
  beforeDestroy() {
    this.destroyRandomizer();
  },
  mounted() {
    // Interval in milliseconds between each randomization
    const randomizeIntervalMs = 750;

    // Delay in milliseconds before displaying the message
    const displayStartDelayMs = 3000;

    const self = this;
    this.randomizer = setInterval(function () {
      self.randomize();
    }, randomizeIntervalMs);
    setTimeout(function () {
      clearInterval(self.randomizer);
      self.display();
    }, displayStartDelayMs);
  },
  methods: {
    randomize() {
      this.characters = this.createRandomChars();
      this.isBoardReady = true;
    },
    stopRandomization() {
      this.destroyRandomizer;
      this.display();
    },

    // Destroys the randomizer timer
    destroyRandomizer() {
      if (this.randomizer) {
        clearInterval(self.randomizer);
        this.randomizer = null;
      }
    },

    getRandomChar() {
      return String.fromCharCode(
        this.getRandomInt(this.asciiStart, this.asciiEnd)
      );
    },

    /// Returns a random integer between min (inclusive) and max (exclusive)
    getRandomInt(min, max) {
      // Ensure min and max are integers and min is less than max
      min = Math.ceil(Math.max(0, min));
      max = Math.floor(Math.max(min, max));

      // The maximum is exclusive and the minimum is inclusive
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    createRandomChars() {
      const chars = [];
      for (let r = 0; r < 1000; r++) {
        chars.push({
          char: this.getRandomChar(),
          class: "",
          matched: false,
        });
      }

      return chars;
    },

    display() {
      // Put the message in a random location as a char
      // Somewhere in the middle
      let startLocation = this.characters.length / 2;

      // To avoid out of boundry
      const endLocation = this.characters.length - 1 - this.message.length;
      this.randomLocation = this.getRandomInt(startLocation, endLocation);

      let charIndex = 0;
      for (let i = 0; i < this.characters.length; i++) {
        const char = this.characters[i];

        // Check if I'm in the randomLocation's boundry
        if (
          i >= this.randomLocation &&
          i < this.randomLocation + this.message.length
        ) {
          char.matched = true;
          char.class = "matched";
          char.char = this.message[charIndex];
          charIndex++;
        } else {
          char.class = "unmatched";
          char.matched = false;
        }
      }
      this.scrollToMessage();
    },

    scrollToMessage() {
      this.$nextTick(() => {
        const refName = this.randomLocation;
        const messageStartElement = this.$refs[refName];

        if (
          messageStartElement &&
          messageStartElement.length > 0 &&
          messageStartElement[0]
        ) {
          messageStartElement[0].scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      });
    },
  },
};
</script>

<style scoped>
.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #c4872b;
  text-align: center;
  font-family: "LCD-Solid";
}

#board {
  background-color: #000;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.unmatched {
  opacity: 0.3 !important;
}

.char {
  margin: 10px;
  float: left;
  font-size: 36px;
  font-family: "LCD-Solid";
  color: #c4872b;
}
</style>
