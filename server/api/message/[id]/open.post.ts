// SPDX-License-Identifier: AGPL-3.0-only

import { MessageRepository } from "~/server/repositories/message.repository";
import { OpenMessage } from "~/server/usecases/message/open.message";
import db from "~/server/utils/db";

// Burn after read: returns the payload once and deletes the row atomically.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";

  try {
    const openMessageUseCase = new OpenMessage(new MessageRepository(db));
    const payload = await openMessageUseCase.execute(id);

    if (payload === null) {
      setResponseStatus(event, 404);
      return { message: "Message not found or has expired." };
    }

    return payload;
  } catch {
    setResponseStatus(event, 500);
    return { message: "Something went wrong." };
  }
});
