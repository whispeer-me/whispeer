// SPDX-License-Identifier: AGPL-3.0-only

import type { ChatMessage } from "~/types/chat.message";

import type { EncryptedMessage } from "~/types/encrypted.message";

// ponytail: dead code (pages/chat is in .nuxtignore) still on the removed v1
// crypto API; deleted in task 03, not ported.

// eslint-disable-next-line import/no-mutable-exports
export let id = 1;

export default {
  createMessage (content: string, passphrase: string): EncryptedMessage {
    return cryptoService.encrypt(content, passphrase);
  },

  readTheMessage (
    chatMessage: EncryptedMessage,
    passphrase: string,
  ): ChatMessage {
    const decryptedContent = cryptoService.decrypt(
      chatMessage.ciphertext,
      chatMessage.salt,
      chatMessage.iv,
      passphrase,
    );

    return {
      id: id++,
      content: decryptedContent,
    } as ChatMessage;
  },
};
