// SPDX-License-Identifier: AGPL-3.0-only

import { GetStats } from "~/server/usecases/message/get.stats";
import { MessageRepository } from "~/server/repositories/message.repository";
import db from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    const getMessageStatsUseCase = new GetStats(new MessageRepository(db));
    return await getMessageStatsUseCase.execute();
  } catch {
    setResponseStatus(event, 500);
    return { message: "Something went wrong." };
  }
});
