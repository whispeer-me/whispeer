import { Message } from "~/server/entities/message";

export interface IMessageRepository {
  save(message: Message): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  increaseViewCount(id: string): Promise<void>;
  deleteExpiredMessages(): Promise<void>;
}
