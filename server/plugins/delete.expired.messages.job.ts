// SPDX-License-Identifier: AGPL-3.0-only

/* eslint-disable no-console */

import { DeleteExpiredMessages } from "../usecases/message/delete.expired.messages";
import { useScheduler } from "#scheduler";
import { MessageRepository } from "~/server/repositories/message.repository";
import db from "~/server/utils/db";

const JOB_NAME = "`Delete Expired Messages` job";

export default defineNitroPlugin(() => {
  const scheduler = useScheduler();
  scheduler.run(deleteExpiredMessages).hourly();
  console.log(`${JOB_NAME} has been scheduled.`);
});

async function deleteExpiredMessages () {
  try {
    const messageRepository = new MessageRepository(db);
    const messageDeleteUseCase = new DeleteExpiredMessages(messageRepository);

    console.info(`Running ${JOB_NAME}.`);

    await messageDeleteUseCase.execute();

    console.info(`${JOB_NAME} completed successfully.`);
  } catch (err) {
    console.error(`Error occurred on ${JOB_NAME}.`, err);
  }
}
