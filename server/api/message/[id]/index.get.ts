// SPDX-License-Identifier: AGPL-3.0-only

import { MessageRepository } from "~/server/repositories/message.repository";
import { FindMessage } from "~/server/usecases/message/find.message";
import db from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";

  try {
    const findMessageUseCase = new FindMessage(new MessageRepository(db));
    const message = await findMessageUseCase.execute(id);

    if (message === null) {
      setResponseStatus(event, 404);
      return { message: "Message not found or has expired." };
    }

    return message;
  } catch {
    setResponseStatus(event, 500);
    return { message: "Something went wrong." };
  }
});
