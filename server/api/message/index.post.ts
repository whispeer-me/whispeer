// SPDX-License-Identifier: AGPL-3.0-only

import { CreateMessage } from "~/server/usecases/message/create";
import { MessageRepository } from "~/server/repositories/message.repository";
import db from "~/server/utils/db";
import { validateMessagePayload } from "~/server/utils/validate.message";

export default defineEventHandler(async (event) => {
  let payload;
  try {
    payload = validateMessagePayload(await readBody(event));
  } catch {
    payload = null;
  }

  if (payload === null) {
    setResponseStatus(event, 400);
    return { message: "Invalid message." };
  }

  try {
    const createMessageUseCase = new CreateMessage(new MessageRepository(db));
    const { id } = await createMessageUseCase.execute(payload);

    setResponseStatus(event, 201);
    return { id };
  } catch {
    setResponseStatus(event, 500);
    return { message: "Something went wrong." };
  }
});
