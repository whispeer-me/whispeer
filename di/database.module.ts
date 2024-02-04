import { defineNuxtModule } from "@nuxt/kit";
import { PgPool } from "./../server/repositories/db";
import { DIContainer } from "./dependency.injector";

// The paths above must be relative, ~ not working in module level

export default defineNuxtModule({
  setup(_, nuxt) {
    const databaseURL = process.env.DATABASE_URL || "";
    const dbPool = new PgPool(databaseURL);

    // Injecting the database pool into the DI container
    DIContainer.inject("DbPool", dbPool);

    console.log("Database pool initialized and injected");
  },
});
