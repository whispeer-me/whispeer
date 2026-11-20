// SPDX-License-Identifier: AGPL-3.0-only

import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import type { EncryptedPayload } from "~/types/encrypted.message";

export class CreateMessage {
  constructor (private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  // Expects a payload already checked by validateMessagePayload.
  async execute (payload: EncryptedPayload): Promise<{ id: string }> {
    const { id } = await this.messageRepo.save(payload);
    return { id };
  }
}
