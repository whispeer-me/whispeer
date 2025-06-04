// SPDX-License-Identifier: AGPL-3.0-only

import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";

export class PatchMessage {
  constructor (private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute (id: string): Promise<void> {
    await this.messageRepo.increaseViewCount(id);
  }
}
