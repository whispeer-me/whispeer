import { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";

export class PatchMessage {
  constructor(private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute(id: string): Promise<void> {
    this.messageRepo.increaseViewCount(id);
  }
}
