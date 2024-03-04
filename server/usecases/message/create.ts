// SPDX-License-Identifier: AGPL-3.0-only

import { Message } from "~/server/entities/message";
import { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";

export class CreateMessage {
  constructor (private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute (message: Message): Promise<Message> {
    return await this.messageRepo.save(message);
  }
}
