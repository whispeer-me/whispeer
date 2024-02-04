import { PgPool } from "~/server/lib/pg.pool";

const db = new PgPool(process.env.DATABASE_URL || "");

export default db;
