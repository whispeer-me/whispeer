// SPDX-License-Identifier: AGPL-3.0-only

import { MessageRepository } from "~/server/repositories/message.repository";
import { FindMessage } from "~/server/usecases/message/find.message";
import db from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id.index") as string;

  try {
    const messageRepository = new MessageRepository(db);
    const findMessageUseCase = new FindMessage(messageRepository);

    const existingMessage = await findMessageUseCase.execute(id);

    if (existingMessage === null) {
      setResponseStatus(event, 404);

      return {
        message: "Message not found or has expired.",
      };
    }

    return existingMessage;
  } catch (error) {
    setResponseStatus(event, 500);
    return { message: "Error occurred and logged." };
  }
});
