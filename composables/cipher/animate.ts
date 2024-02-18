import { ref, onMounted, onUnmounted } from "vue";
import { getRandomChar } from "./random-chars";

export default function useAnimatedMessage(message = "", duration = 1000) {
  const displayMessage = ref("");
  const isAnimating = ref(false);

  let animationFrameId: number;

  const animateMessage = () => {
    displayMessage.value = Array.from(
      { length: message.length },
      getRandomChar
    ).join("");
  };

  const startAnimation = () => {
    isAnimating.value = true;
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    const startTime = performance.now();

    const animate = (now: number) => {
      if (now - startTime < duration) {
        animateMessage();
        animationFrameId = requestAnimationFrame(animate);
      } else {
        displayMessage.value = message;
        isAnimating.value = false;
      }
    };

    animate(startTime);
  };

  onMounted(() => {
    startAnimation();
  });

  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    isAnimating.value = false;
  });

  return { displayMessage, isAnimating };
}
