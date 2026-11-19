// SPDX-License-Identifier: AGPL-3.0-only

import type { ChatMessage } from "~/types/chat.message";
import type { EncryptResult } from "~/types/encrypted.message";

// ponytail: prototype (pages/chat is in .nuxtignore). The per-message link key
// travels next to the ciphertext over the socket, so the socket server could
// read it. Upgrade: a room key shared via the URL fragment and a CryptoService
// variant that accepts a caller-supplied key.

// eslint-disable-next-line import/no-mutable-exports
export let id = 1;

export default {
  async createMessage (
    content: string,
    passphrase: string,
  ): Promise<EncryptResult> {
    return await cryptoService.encrypt(content, {
      passphrase,
      burnAfterRead: false,
    });
  },

  async readTheMessage (
    chatMessage: EncryptResult,
    passphrase: string,
  ): Promise<ChatMessage> {
    const decryptedContent = await cryptoService.decrypt(
      chatMessage.payload,
      chatMessage.linkKey,
      passphrase,
    );

    return {
      id: id++,
      content: decryptedContent,
    } as ChatMessage;
  },
};
