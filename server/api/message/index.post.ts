import { CreateMessage } from "~/server/usecases/message/create";
import { MessageRepository } from "~/server/repositories/message.repository";
import db from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const receivedMessage = await readBody(event);

  const messageRepository = new MessageRepository(db);

  const createMessageUseCase = new CreateMessage(messageRepository);
  const message = await createMessageUseCase.execute(receivedMessage);

  setResponseStatus(event, 201);

  return message;
});
