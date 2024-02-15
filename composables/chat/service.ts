import type { ChatMessage } from "~/types/chat.message";

export let id = 1;

export default {
  createMessage(
    content: string,
    _passphrase: string // This will be used later
  ): ChatMessage {
    const chatMessage: ChatMessage = {
      id: id++,
      content: content,
    };

    return chatMessage;
  },
};
