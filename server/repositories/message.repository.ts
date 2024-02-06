import { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import type { Message } from "~/server/entities/message";
import { IDatabasePool } from "~/server/interfaces/db/IDatabasePool";

export class MessageRepository implements IMessageRepository {
  private pool: IDatabasePool;

  constructor(pool: IDatabasePool) {
    this.pool = pool;
  }

  async increaseViewCount(id: string): Promise<void> {
    const updateMessageQuery = `
    UPDATE messages
    SET view_count = view_count + 1
    WHERE id = $1;
  `;

    const updateStatsQuery = `
    UPDATE message_stats
    SET view_count = view_count + 1
    WHERE id = 1;
  `;

    await this.pool.query("BEGIN");

    try {
      await this.pool.query(updateMessageQuery, [id]);
      await this.pool.query(updateStatsQuery);
      await this.pool.query("COMMIT");
    } catch (err) {
      await this.pool.query("ROLLBACK");
      throw err;
    }
  }

  async deleteExpiredMessages(): Promise<void> {
    const query = `
    DELETE FROM messages
    WHERE created_at < NOW() - INTERVAL '24 hours';
  `;
    await this.pool.query(query);
  }

  async save(messageData: Message): Promise<Message> {
    let id = await this.createUniqueIdForMessage();
    const insertMessageQuery = `
      INSERT INTO messages (id, content, iv, salt, is_private)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const messageValues = [
      id,
      messageData.content,
      messageData.iv,
      messageData.salt,
      messageData.is_private,
    ];

    const updateStatsQuery = `
      UPDATE message_stats
      SET created_count = created_count + 1
      WHERE id = 1;
    `;

    await this.pool.query("BEGIN");

    try {
      const { rows: messageRows } = await this.pool.query(
        insertMessageQuery,
        messageValues
      );
      await this.pool.query(updateStatsQuery);
      await this.pool.query("COMMIT");
      return messageRows[0];
    } catch (err) {
      await this.pool.query("ROLLBACK");
      throw err;
    }
  }

  async createUniqueIdForMessage(attempt = 0): Promise<String> {
    let id = IDGenerator.generate(10);
    const query = `INSERT INTO archived_ids (id) VALUES ($1)`;

    try {
      await this.pool.query(query, [id]);
      return id;
    } catch (err) {
      if (err instanceof Error) {
        let pgUniqueViolationErrorCode = "23505";
        const pgError = err as any; // Cast to 'any' or a more specific error type if you have one
        if (pgError.code === pgUniqueViolationErrorCode) {
          // Check if the error is a unique violation
          if (attempt < 10) {
            // If the maximum number of attempts has not been reached, try again
            return this.createUniqueIdForMessage(attempt + 1);
          } else {
            // If the maximum number of attempts has been reached, handle the error
            throw new Error("Failed to generate a unique ID after 10 attempts");
          }
        } else {
          // If the error is not a unique violation, rethrow it or handle it as needed
          throw err;
        }
      } else {
        // If 'err' is not an instance of Error, handle or rethrow as needed
        throw new Error("An unknown error occurred");
      }
    }
  }

  async findById(id: string): Promise<Message | null> {
    const query =
      "SELECT * FROM messages WHERE id = $1 and created_at > NOW() - INTERVAL '24 hours'";
    const { rows } = await this.pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  async getStats(): Promise<{
    created_count: number;
    view_count: number;
    expiring_soon_count: number;
  }> {
    const getMessageStats = async (): Promise<{
      created_count: number;
      view_count: number;
    }> => {
      const query = `SELECT created_count, view_count FROM message_stats where id = 1`;
      const result = await this.pool.query(query);
      let row = result.rows[0];
      return {
        created_count: row.created_count,
        view_count: row.view_count,
      };
    };

    const getExpiringCount = async (): Promise<number> => {
      const query = `SELECT COUNT(*) FROM messages`;
      const result = await this.pool.query(query);
      if (result.rows.length === 0) {
        return 0;
      }
      return parseInt(result.rows[0].count);
    };

    const { created_count, view_count } = await getMessageStats();
    const expiring_soon_count = await getExpiringCount();

    return {
      created_count,
      view_count,
      expiring_soon_count,
    };
  }
}
