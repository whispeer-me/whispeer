// SPDX-License-Identifier: AGPL-3.0-only

import { ref, nextTick, onMounted, onUnmounted } from "vue";
import chatService from "@/composables/chat/service";
import type EncryptedMessage from "~/types/encrypted.message";

export default function useChat() {
  {
    // It will be prompted later
    const passphrase = "bla bla";
    const message = ref("");
    const messages = ref([]);
    const messagesContainer = ref<HTMLElement | null>(null);
    const userHasScrolledUp = ref(false);
    const showNewMessageNotification = ref(false);

    let socket: WebSocket;

    onMounted(() => {
      const websockerUrl = "ws://localhost:3001";
      socket = new WebSocket(websockerUrl);
      socket.onopen = () => {
        console.log("Connected to the chat server");
      };

      socket.onmessage = (event) => {
        console.log("Received message", event.data);
        const message = JSON.parse(event.data) as EncryptedMessage;

        const decryptedMessage = chatService.readTheMessage(
          message,
          passphrase
        );

        console.log("message: ", message);
        messages.value.push(decryptedMessage);
      };
    });

    onUnmounted(() => {
      socket.close();
    });

    const sendMessage = async () => {
      const content = message.value.trim();
      if (content.length === 0) {
        return;
      }

      let encryptedMessage = chatService.createMessage(content, passphrase);
      socket.send(JSON.stringify(encryptedMessage));

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
