// SPDX-License-Identifier: AGPL-3.0-only

import { PgPool } from "~/server/lib/pg.pool";

const db = new PgPool(process.env.DATABASE_URL || "");

export default db;
