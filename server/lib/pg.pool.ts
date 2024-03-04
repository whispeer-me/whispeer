// SPDX-License-Identifier: AGPL-3.0-only

import * as PG from "pg";
import { IDatabasePool } from "~/server/interfaces/db/IDatabasePool";

export class PgPool implements IDatabasePool {
  private _pool: PG.Pool;

  constructor (connectionString: string) {
    this._pool = new PG.Pool({ connectionString });
  }

  async query (
    text: string,
    params?: any[],
  ): Promise<{ rows: any[]; rowCount: number | null }> {
    return await this._pool.query(text, params);
  }
}
