// SPDX-License-Identifier: AGPL-3.0-only

import { GetStats } from "~/server/usecases/message/get.stats";
import { MessageRepository } from "~/server/repositories/message.repository";
import db from "~/server/utils/db";

export default defineEventHandler(async () => {
  try {
    const messageRepository = new MessageRepository(db);
    const getMessageStatsUseCase = new GetStats(messageRepository);
    const stats = await getMessageStatsUseCase.execute();

    return stats;
  } catch (err) {
    const error = err as Error;
    throw error;
  }
});
