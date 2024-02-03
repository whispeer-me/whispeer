import { Message } from "../../entities/message";
import { IMessageRepository } from "../../interfaces/repositories/IMessageRepository";

export class CreateMessage {
  constructor(private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute(message: Message): Promise<Message> {
    return await this.messageRepo.save(message);
  }
}
