export default function (min: number, max: number): number {
  min = Math.ceil(Math.max(0, min));
  max = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
