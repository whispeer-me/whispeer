import { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";

export class DeleteExpiredMessages {
  constructor(private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute(): Promise<void> {
    return await this.messageRepo.deleteExpiredMessages();
  }
}
