// SPDX-License-Identifier: AGPL-3.0-only

import { MessageRepository } from "~/server/repositories/message.repository";
import { PatchMessage } from "~/server/usecases/message/patch.message";
import db from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";

  try {
    // At the moment it's only used to increase the view count (normal messages).
    const patchMessageUseCase = new PatchMessage(new MessageRepository(db));
    const updated = await patchMessageUseCase.execute(id);

    if (!updated) {
      setResponseStatus(event, 404);
      return { message: "Message not found or has expired." };
    }

    setResponseStatus(event, 204);
  } catch {
    setResponseStatus(event, 500);
    return { message: "Something went wrong." };
  }
});
