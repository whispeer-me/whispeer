import { Message } from "~/server/entities/message";
import { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import { TimeUtils } from "~/server/utils/time.utils";

export class FindMessage {
  constructor(private messageRepo: IMessageRepository) {
    this.messageRepo = messageRepo;
  }

  async execute(id: string): Promise<Message | null> {
    let message = await this.messageRepo.findById(id);

    if (message) {
      message.expires_in = TimeUtils.createExpireTimeMessage(
        message.created_at,
        new Date()
      );
    }

    return message;
  }
}
