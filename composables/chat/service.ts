import type { ChatMessage } from "~/types/chat.message";

import type EncryptedMessage from "~/types/encrypted.message";

export let id = 1;

export default {
  createMessage(content: string, passphrase: string): EncryptedMessage {
    return cryptoService.encrypt(content, passphrase);
  },

  readTheMessage(
    chatMessage: EncryptedMessage,
    passphrase: string
  ): ChatMessage {
    let decryptedContent = cryptoService.decrypt(
      chatMessage.ciphertext,
      chatMessage.salt,
      chatMessage.iv,
      passphrase
    );

    return {
      id: id++,
      content: decryptedContent,
    } as ChatMessage;
  },
};
