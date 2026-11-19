// SPDX-License-Identifier: AGPL-3.0-only

import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import { isValidMessageId } from "~/server/utils/message.id";
import type { EncryptedPayload } from "~/types/encrypted.message";

export class OpenMessage {
  constructor (private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  // Returns the burn message payload once; the row is deleted in the same statement.
  async execute (id: string): Promise<EncryptedPayload | null> {
    if (!isValidMessageId(id)) {
      return null;
    }

    const opened = await this.messageRepo.openBurnMessage(id);
    if (!opened) {
      return null;
    }

    return {
      version: opened.version,
      content: opened.content,
      salt: opened.salt,
      iv: opened.iv,
      has_passphrase: opened.has_passphrase,
      burn_after_read: true,
    };
  }
}
