// SPDX-License-Identifier: AGPL-3.0-only

import { CreateMessage } from "~/server/usecases/message/create";
import { MessageRepository } from "~/server/repositories/message.repository";
import db from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    const receivedMessage = await readBody(event);

    const messageRepository = new MessageRepository(db);

    const createMessageUseCase = new CreateMessage(messageRepository);
    const message = await createMessageUseCase.execute(receivedMessage);

    setResponseStatus(event, 201);

    return message;
  } catch (error) {
    setResponseStatus(event, 500);
    return { message: "Error occurred and logged." };
  }
});
