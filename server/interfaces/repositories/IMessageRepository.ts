import { Message } from "~/server/entities/message";

export interface IMessageRepository {
  save(message: Message): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  increaseViewCount(id: string): Promise<void>;
  deleteExpiredMessages(): Promise<void>;
  getStats(): Promise<{
    created_count: number;
    view_count: number;
    expiring_soon_count: number;
  }>;
}
