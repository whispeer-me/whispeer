import pg from "pg";
import { IDatabasePool } from "~/server/interfaces/db/IDatabasePool";

export class PgPool implements IDatabasePool {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  async query(
    text: string,
    params?: any[]
  ): Promise<{ rows: any[]; rowCount: number | null }> {
    return this.pool.query(text, params);
  }
}
