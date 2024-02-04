import { CreateMessage } from "~/server/usecases/message/create";
import { MessageRepository } from "~/server/repositories/message.repository";
import { PgPool } from "~/server/lib/pg.pool";

export default defineEventHandler(async (event) => {
  const receivedMessage = await readBody(event);

  const db = new PgPool(process.env.DATABASE_URL || "");
  const messageRepository = new MessageRepository(db);

  const createMessageUseCase = new CreateMessage(messageRepository);
  const message = await createMessageUseCase.execute(receivedMessage);

  return message;
});
