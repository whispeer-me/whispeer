// SPDX-License-Identifier: AGPL-3.0-only

import { CreateMessage } from "~/server/usecases/message/create";
import { MessageRepository } from "~/server/repositories/message.repository";
import db from "~/server/utils/db";
import { validateMessagePayload } from "~/server/utils/validate.message";
import { readJsonBodyCapped } from "~/server/utils/read.body";
import { MAX_BODY_BYTES } from "~/security.config";

export default defineEventHandler(async (event) => {
  let payload;
  try {
    payload = validateMessagePayload(await readJsonBodyCapped(event, MAX_BODY_BYTES));
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode === 413) {
      setResponseStatus(event, 413);
      return { message: "Message too large." };
    }
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
