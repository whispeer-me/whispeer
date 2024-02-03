import { describe, it, expect, vi } from "vitest";

import type { Message } from "~/server/entities/message";
import { CreateMessage } from "~/server/usecases/message/create";
import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import { IDGenerator } from "~/server/utils/id.generator";

const randomIdLength = 10;

class MockMessageRepository implements IMessageRepository {
  findById(id: string): Promise<Message | null> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async save(message: Message): Promise<Message> {
    return {
      ...message,
      id: IDGenerator.generate(randomIdLength),
      view_count: 0,
      created_at: new Date(),
    };
  }
}

describe("CreateMessage Use Case", () => {
  const mockRepository = new MockMessageRepository();
  const createMessage = new CreateMessage(mockRepository);

  it("can create a non-private message with null values", async () => {
    const content = "Hello, World!";

    const message: Message = {
      id: undefined,
      content,
      is_private: false,
      salt: undefined,
      iv: undefined,
      view_count: undefined,
      created_at: undefined,
      expires_in: undefined,
    };

    const createdMessage = await createMessage.execute(message);

    expect(createdMessage.id).not.toBeUndefined();
    expect(createdMessage.id).toHaveLength(randomIdLength);
    expect(createdMessage.content).toBe(content);
    expect(createdMessage.is_private).toBe(false);
  });

  it("can create a private message", async () => {
    const encryptedContent = "DKhgS9+OTPBBo0V4nl6Knw==";

    const message: Message = {
      id: undefined,
      content: encryptedContent,
      salt: "1066970ac090c98c7b8753a40d785219",
      iv: "5861eec91ad30d72b6f9e164378f1e28",
      is_private: true,
      view_count: undefined,
      created_at: undefined,
      expires_in: undefined,
    };

    const createdMessage = await createMessage.execute(message);

    expect(createdMessage.id).not.toBeUndefined();
    expect(createdMessage.id).toHaveLength(randomIdLength);
    expect(createdMessage.content).toBe(encryptedContent);
    expect(createdMessage.is_private).toBe(true);
  });
});
