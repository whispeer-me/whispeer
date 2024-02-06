import { MessageRepository } from "~/server/repositories/message.repository";
import { PatchMessage } from "~/server/usecases/message/patch.message";
import db from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id.index") as string;

  const messageRepository = new MessageRepository(db);
  const patchMessageUseCase = new PatchMessage(messageRepository);

  try {
    // At the moment it's been used only for increasing the count
    await patchMessageUseCase.execute(id);
    setResponseStatus(event, 204);
  } catch (error) {
    console.error(error);
    setResponseStatus(event, 500);
    return { message: "Error occurred and logged." };
  }
});
