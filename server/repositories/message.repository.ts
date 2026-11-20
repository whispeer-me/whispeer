// SPDX-License-Identifier: AGPL-3.0-only

/* eslint-disable camelcase */

import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import type { OpenedPayload, StoredMessage } from "~/server/entities/message";
import type { IDatabasePool } from "~/server/interfaces/db/IDatabasePool";
import type { EncryptedPayload } from "~/types/encrypted.message";
import { IDGenerator } from "~/server/utils/id.generator";

const LIVE = "created_at > NOW() - INTERVAL '24 hours'";

// Multi-step writes are single statements with data-modifying CTEs: a pg Pool
// may run each query() on a different client, so BEGIN/COMMIT via pool.query
// would not be a real transaction.
export class MessageRepository implements IMessageRepository {
  private pool: IDatabasePool;

  constructor (pool: IDatabasePool) {
    this.pool = pool;
  }

  async save (payload: EncryptedPayload): Promise<{ id: string }> {
    const id = await this.createUniqueIdForMessage();
    const query = `
      WITH inserted AS (
        INSERT INTO messages (id, version, content, salt, iv, has_passphrase, burn_after_read)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      ), stats AS (
        UPDATE message_stats
        SET created_count = created_count + 1
        WHERE id = 1
      )
      SELECT id FROM inserted;
    `;
    const { rows } = await this.pool.query(query, [
      id,
      payload.version,
      payload.content,
      payload.salt,
      payload.iv,
      payload.has_passphrase,
      payload.burn_after_read,
    ]);
    return { id: rows[0].id };
  }

  async findById (id: string): Promise<StoredMessage | null> {
    const query = `
      SELECT id, version, content, salt, iv, has_passphrase, burn_after_read, view_count, created_at
      FROM messages
      WHERE id = $1 AND ${LIVE};
    `;
    const { rows } = await this.pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  async openBurnMessage (id: string): Promise<OpenedPayload | null> {
    const query = `
      WITH opened AS (
        DELETE FROM messages
        WHERE id = $1 AND burn_after_read AND ${LIVE}
        RETURNING version, content, salt, iv, has_passphrase
      ), stats AS (
        UPDATE message_stats
        SET view_count = view_count + 1
        WHERE id = 1 AND EXISTS (SELECT 1 FROM opened)
      )
      SELECT version, content, salt, iv, has_passphrase FROM opened;
    `;
    const { rows } = await this.pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  async increaseViewCount (id: string): Promise<boolean> {
    const query = `
      WITH updated AS (
        UPDATE messages
        SET view_count = view_count + 1
        WHERE id = $1 AND NOT burn_after_read AND ${LIVE}
        RETURNING id
      ), stats AS (
        UPDATE message_stats
        SET view_count = view_count + 1
        WHERE id = 1 AND EXISTS (SELECT 1 FROM updated)
      )
      SELECT id FROM updated;
    `;
    const { rows } = await this.pool.query(query, [id]);
    return rows.length > 0;
  }

  async deleteExpiredMessages (): Promise<void> {
    const query = `
      DELETE FROM messages
      WHERE created_at <= NOW() - INTERVAL '24 hours';
    `;
    await this.pool.query(query);
  }

  async createUniqueIdForMessage (attempt = 0): Promise<string> {
    const id = IDGenerator.generate(10);
    const query = "INSERT INTO archived_ids (id) VALUES ($1)";

    try {
      await this.pool.query(query, [id]);
      return id;
    } catch (err) {
      const pgUniqueViolationErrorCode = "23505";
      if ((err as { code?: string })?.code !== pgUniqueViolationErrorCode) {
        throw err;
      }
      if (attempt >= 10) {
        throw new Error("Failed to generate a unique ID after 10 attempts");
      }
      return this.createUniqueIdForMessage(attempt + 1);
    }
  }

  async getStats (): Promise<{
    created_count: number;
    view_count: number;
    expiring_soon_count: number;
  }> {
    const statsResult = await this.pool.query(
      "SELECT created_count, view_count FROM message_stats WHERE id = 1",
    );
    const countResult = await this.pool.query(
      `SELECT COUNT(*) AS count FROM messages WHERE ${LIVE}`,
    );
    const { created_count, view_count } = statsResult.rows[0];
    const expiring_soon_count = countResult.rows.length
      ? parseInt(countResult.rows[0].count)
      : 0;

    return { created_count, view_count, expiring_soon_count };
  }
}
