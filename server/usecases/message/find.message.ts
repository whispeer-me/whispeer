// SPDX-License-Identifier: AGPL-3.0-only

/* eslint-disable camelcase */

import type { PublicMessage } from "~/server/entities/message";
import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import { isValidMessageId } from "~/server/utils/message.id";
import { TimeUtils } from "~/server/utils/time.utils";

export class FindMessage {
  constructor (private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute (id: string): Promise<PublicMessage | null> {
    if (!isValidMessageId(id)) {
      return null;
    }

    const message = await this.messageRepo.findById(id);
    if (!message) {
      return null;
    }

    const expires_in = TimeUtils.createExpireTimeMessage(message.created_at, new Date());

    // Burn messages never expose ciphertext here: link previews and scanners
    // must neither read nor burn them (that is POST /:id/open).
    if (message.burn_after_read) {
      return {
        id: message.id,
        version: message.version,
        has_passphrase: message.has_passphrase,
        burn_after_read: true,
        expires_in,
      };
    }

    return {
      id: message.id,
      version: message.version,
      content: message.content,
      salt: message.salt,
      iv: message.iv,
      has_passphrase: message.has_passphrase,
      burn_after_read: false,
      view_count: message.view_count,
      expires_in,
    };
  }
}
