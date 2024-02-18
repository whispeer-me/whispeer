/// Logic for how to randomize characters
const asciiStart = 33;
const asciiEnd = 126;

export const getRandomChar = () =>
  String.fromCharCode(randomNumber(asciiStart, asciiEnd));

export const createRandomChars = (randomCharsCount: number = 2000) => {
  return Array.from({ length: randomCharsCount }, () => ({
    char: getRandomChar(),
    class: "",
    matched: false,
  }));
};
