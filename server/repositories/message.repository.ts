import { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import type { Message } from "~/server/entities/message";

export class MessageRepository implements IMessageRepository {
  async save(message: Message): Promise<Message> {
    return {
      ...message,
      id: "123",
      view_count: 0,
      created_at: new Date(),
    };
  }

  async findById(id: string): Promise<Message | null> {
    return null;
  }

  async delete(id: string): Promise<void> {}
}
