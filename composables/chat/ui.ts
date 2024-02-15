import { ref, nextTick } from "vue";
import chatService from "@/composables/chat/service";

export default function useChat() {
  {
    // It will be prompted later
    const passphrase = "bla bla";
    const message = ref("");
    const messages = ref([
      chatService.createMessage("Hello, World!", passphrase),
    ]);
    const messagesContainer = ref<HTMLElement | null>(null);
    const userHasScrolledUp = ref(false);
    const showNewMessageNotification = ref(false);

    const sendMessage = async () => {
      const content = message.value.trim();
      if (content.length === 0) {
        return;
      }

      messages.value.push(chatService.createMessage(content, passphrase));

      message.value = "";

      await maybeScrollToBottom();
    };

    const checkScrollPosition = () => {
      // How far from the bottom should consider user wants to see old message
      // So that we won't scroll to bottom on new message arrives
      // But we want to notify them on new message arrives in such case

      if (messagesContainer.value) {
        const threshold = 100;
        const position =
          messagesContainer.value.scrollHeight -
          messagesContainer.value.scrollTop -
          messagesContainer.value.clientHeight;
        userHasScrolledUp.value = position > threshold;
        // Shall notify the user?
        if (!userHasScrolledUp.value) {
          showNewMessageNotification.value = userHasScrolledUp.value;
        }
      }
    };

    const maybeScrollToBottom = async () => {
      await nextTick();
      if (!userHasScrolledUp.value && messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
        showNewMessageNotification.value = false;
      } else {
        showNewMessageNotification.value = true;
      }
    };

    const scrollToBottom = async () => {
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTo({
          top: messagesContainer.value.scrollHeight,
          behavior: "smooth",
        });
      }

      showNewMessageNotification.value = false;
    };

    // At the moment it's for demonstration purpose
    // Later it will set the class based on the message sender / receiver
    const getMessageClass = (id: number): string => {
      return id % 2 == 0 ? "sender" : "receiver";
    };

    const maxCharsAllowed = constants.MESSAGE_MAX_CHARS_ALLOWED;

    return {
      message,
      messages,
      sendMessage,
      checkScrollPosition,
      scrollToBottom,
      showNewMessageNotification,
      messagesContainer,
      getMessageClass,
      maxCharsAllowed,
    };
  }
}
