// SPDX-License-Identifier: AGPL-3.0-only

import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";

export class GetStats {
  constructor (private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute (): Promise<{
    created_count: number;
    view_count: number;
    expiring_soon_count: number;
  }> {
    return await this.messageRepo.getStats();
  }
}
