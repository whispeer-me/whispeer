import { DIContainer } from "./dependency.injector";
import { MessageRepository } from "../server/repositories/message.repository";
import { CreateMessage } from "../server/usecases/message/create";

export function setupDependencies() {
  // It should be already created via database module
  const dbPool = DIContainer.resolve("DbPool");
  DIContainer.inject("MessageRepository", new MessageRepository(dbPool));
  DIContainer.inject(
    "CreateMessage",
    new CreateMessage(DIContainer.resolve("MessageRepository"))
  );
}
