// SPDX-License-Identifier: AGPL-3.0-only

import { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";

export class DeleteExpiredMessages {
  constructor(private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute(): Promise<void> {
    return await this.messageRepo.deleteExpiredMessages();
  }
}
