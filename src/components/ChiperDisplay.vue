<template>
  <div id="board" v-if="isBoardReady">
    <div v-for="(row, r) in rows" :key="r">
      <span
        class="char"
        v-for="(cell, c) in cols"
        :key="createId(r, c)"
        :class="matrix[r][c].class"
        :ref="getCellRef(r, c)"
      >
        {{ matrix[r][c].char }}
      </span>
    </div>
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
      matrix: [],
      startMatching: false,
      asciiStart: 33,
      asciiEnd: 126,
      randomRow: 0,
      randomCol: 0,
      isBoardReady: false,
      loadingText: "L o a d i n g . . .",
    };
  },
  beforeDestroy() {
    this.destroyRandomizer();
  },
  computed: {
    screenWidth() {
      return window.innerWidth;
    },
    screenHeight() {
      return window.innerHeight;
    },
    charWidth() {
      return 36;
    },
    charHeight() {
      return 36;
    },
    rows() {
      return Math.floor(this.screenHeight / this.charHeight);
    },
    cols() {
      return Math.floor(this.screenWidth / this.charWidth);
    },
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
      this.matrix = this.createMatrixWithRandomChars();
      this.randomRow = this.getRandomInt(0, this.rows);
      this.randomCol = this.getRandomInt(0, this.cols);
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

    createMatrixWithRandomChars() {
      const matrix = [];
      for (let r = 0; r < this.rows; r++) {
        matrix[r] = [];
        for (let c = 0; c < this.cols; c++) {
          const char = this.getRandomChar();
          matrix[r][c] = {
            char,
            class: "",
            matched: false,
          };
        }
      }
      return matrix;
    },

    getCellRef(row, col) {
      // Use a unique identifier for each cell that can be used as a ref to scroll later (after animation stop)
      // Due to random position the message can be out of the screen.
      const id = this.createId(row, col);
      return `cell-${id}`;
    },

    createId(row, col) {
      return `${row}-${col}`;
    },

    display() {
      // Since the `getRandomInt` will return the last number exclusive and positive (0)
      // We don't need to substrct 1 from the rows and cols
      // However, to avoid confusion, I rename the variables to `endRowIndex` and `endColIndex`
      let startRowIndex = this.randomRow;
      let startColIndex = this.randomCol;

      // Estimate the rows count needed to display the message
      let linesCount = Math.ceil(this.message.length / this.cols);
      let endRowIndex = startRowIndex + linesCount;

      // Ensure we're still in the bounds of the matrix
      if (endRowIndex > this.rows) {
        startRowIndex = startRowIndex - linesCount;
        endRowIndex = startRowIndex - linesCount;
      }

      let currentRowIndex = startRowIndex;
      let currentColIndex = startColIndex;

      for (
        let messageCharIndex = 0;
        messageCharIndex < this.message.length;
        messageCharIndex++
      ) {
        const char = this.message[messageCharIndex];

        // If the current col is the last col in the matrix, move to the next row
        if (currentColIndex === this.matrix[currentRowIndex].length) {
          // Next row
          currentRowIndex++;

          // Reset the colon index
          currentColIndex = 0;
        }

        this.matrix[currentRowIndex][currentColIndex] = {
          char,
          class: "matched",
          matched: true,
        };

        currentColIndex++;
      }
      this.scrollToMessage();
      this.unmatchOthers();
    },
    unmatchOthers() {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.matrix[r][c].matched) {
            continue;
          }

          this.matrix[r][c].class = "unmatched";
        }
      }
    },
    scrollToMessage() {
      this.$nextTick(() => {
        const refName = this.getCellRef(this.randomRow, this.randomCol);
        const messageStartElement = this.$refs[refName];

        if (messageStartElement && messageStartElement[0]) {
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
