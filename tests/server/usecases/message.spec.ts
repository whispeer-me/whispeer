import { describe, it, expect } from "vitest";

import type { Message } from "~/server/entities/message";
import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import { IDGenerator } from "~/server/utils/id.generator";

import { CreateMessage } from "~/server/usecases/message/create";
import { FindMessage } from "~/server/usecases/message/find.message";

const randomIdLength = 10;

class MockMessageRepository implements IMessageRepository {
  private messages: Message[] = [];

  increaseViewCount(id: string): Promise<void> {
    const existedMessage = this.messages.find((message) => message.id === id);

    if (!existedMessage) {
      throw new Error("Message not found or has expired.");
    }

    if (existedMessage.view_count) {
      existedMessage.view_count += 1;
    }

    return Promise.resolve();
  }

  deleteExpiredMessages(): Promise<void> {
    this.messages = this.messages.filter(
      (message) =>
        message.created_at !== undefined && message.created_at > new Date()
    );
    return Promise.resolve();
  }

  findById(id: string): Promise<Message | null> {
    const existedMessage = this.messages.find((message) => message.id === id);
    if (existedMessage) {
      return Promise.resolve(existedMessage);
    } else {
      return Promise.resolve(null);
    }
  }

  delete(id: string): Promise<void> {
    const existedMessage = this.messages.find((message) => message.id === id);

    if (!existedMessage) {
      throw new Error("Message not found or has expired.");
    }

    // Delete the message from the list by filtering the existing message via id
    this.messages = this.messages.filter((message) => message.id !== id);
    return Promise.resolve();
  }

  async save(message: Message): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: IDGenerator.generate(randomIdLength),
      view_count: 0,
      created_at: new Date(),
    };

    this.messages.push(newMessage);

    return newMessage;
  }
}

describe("Message Use Cases", () => {
  const mockRepository = new MockMessageRepository();
  const createMessageUseCase = new CreateMessage(mockRepository);
  const findMessageUseCase = new FindMessage(mockRepository);

  it("can create a non-private message with null values", async () => {
    const content = "Hello, World!";

    const message: Message = createTestMessage(content);

    const createdMessage = await createMessageUseCase.execute(message);

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

    const createdMessage = await createMessageUseCase.execute(message);

    expect(createdMessage.id).not.toBeUndefined();
    expect(createdMessage.id).toHaveLength(randomIdLength);
    expect(createdMessage.content).toBe(encryptedContent);
    expect(createdMessage.is_private).toBe(true);
  });

  it("returns message when it exists with expiration time string", async () => {
    const content = "Hello, World!";
    const message: Message = createTestMessage(content);

    // To ensure message exists let's create a one.
    const createdMessage = await createMessageUseCase.execute(message);

    expect(createdMessage.id).not.toBeUndefined();

    const id = createdMessage.id as string;

    // Find the message
    const existedMessage = await findMessageUseCase.execute(id);

    expect(existedMessage).not.toBeUndefined();
    expect(existedMessage?.id).toBe(id);
    expect(existedMessage?.expires_in).not.toBeUndefined();
    expect(existedMessage?.expires_in).toBe("23 hours and 59 minutes");
  });

  it("return null when message the message doesn't expired or has expired", async () => {
    const nonExistId = "0123456789";

    // Find the message
    const existedMessage = await findMessageUseCase.execute(nonExistId);

    expect(existedMessage).toBeNull();
  });
});

function createTestMessage(content: string): Message {
  return {
    id: undefined,
    content,
    is_private: false,
    salt: undefined,
    iv: undefined,
    view_count: undefined,
    created_at: undefined,
    expires_in: undefined,
  };
}
