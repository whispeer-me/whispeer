// SPDX-License-Identifier: AGPL-3.0-only

/* eslint-disable import/no-named-as-default-member */

import pg from "pg";
import type { IDatabasePool } from "~/server/interfaces/db/IDatabasePool";

export class PgPool implements IDatabasePool {
  private pool: pg.Pool;

  constructor (connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  async query (
    text: string,
    params?: any[],
  ): Promise<{ rows: any[]; rowCount: number | null }> {
    return await this.pool.query(text, params);
  }
}
