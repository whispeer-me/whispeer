// SPDX-License-Identifier: AGPL-3.0-only

import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import { isValidMessageId } from "~/server/utils/message.id";

export class PatchMessage {
  constructor (private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  // false = bad id, not found, expired or burn message.
  async execute (id: string): Promise<boolean> {
    if (!isValidMessageId(id)) {
      return false;
    }
    return await this.messageRepo.increaseViewCount(id);
  }
}
