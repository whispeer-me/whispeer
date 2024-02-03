import { Message } from "~/server/entities/message";

export interface IMessageRepository {
  save(message: Message): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  delete(id: string): Promise<void>;
}
