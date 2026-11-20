// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect, vi } from "vitest";

import type { IDatabasePool } from "~/server/interfaces/db/IDatabasePool";
import { MessageRepository } from "~/server/repositories/message.repository";
import type { EncryptedPayload } from "~/types/encrypted.message";

const LIVE = /created_at\s*>\s*NOW\(\)\s*-\s*INTERVAL '24 hours'/i;

type Result = { rows: any[]; rowCount: number | null };

const mockPool = (...results: Result[]) => {
  const query = vi.fn<(text: string, params?: any[]) => Promise<Result>>();
  for (const r of results) {
    query.mockResolvedValueOnce(r);
  }
  query.mockResolvedValue({ rows: [], rowCount: 0 });
  const pool: IDatabasePool = { query };
  return { pool, query };
};

const sqlOf = (query: ReturnType<typeof mockPool>["query"]) =>
  query.mock.calls.map(c => c[0]).join("\n");

const payload: EncryptedPayload = {
  version: 2,
  content: "A".repeat(40),
  salt: "A".repeat(22),
  iv: "A".repeat(16),
  has_passphrase: true,
  burn_after_read: false,
};

describe("MessageRepository", () => {
  it("never uses SELECT * or RETURNING *", async () => {
    const { pool, query } = mockPool();
    const repo = new MessageRepository(pool);
    query.mockResolvedValue({ rows: [{ id: "x", created_count: 0, view_count: 0, count: "0" }], rowCount: 1 });

    await repo.save(payload);
    await repo.findById("aZ09bY18cX");
    await repo.openBurnMessage("aZ09bY18cX");
    await repo.increaseViewCount("aZ09bY18cX");
    await repo.deleteExpiredMessages();
    await repo.getStats();

    const sql = sqlOf(query);
    expect(sql).not.toMatch(/SELECT\s+\*/i);
    expect(sql).not.toMatch(/RETURNING\s+\*/i);
    expect(sql).not.toMatch(/is_private/);
  });

  it("save inserts the v2 columns and returns only the id", async () => {
    const { pool, query } = mockPool(
      { rows: [], rowCount: 1 }, // archived_ids
      { rows: [{ id: "aZ09bY18cX", content: "leak" }], rowCount: 1 },
    );
    const result = await new MessageRepository(pool).save(payload);

    expect(result).toEqual({ id: "aZ09bY18cX" });
    const [text, params] = query.mock.calls[1];
    expect(text).toMatch(/INSERT INTO messages \(id, version, content, salt, iv, has_passphrase, burn_after_read\)/);
    expect(text).toMatch(/created_count = created_count \+ 1/);
    expect(params?.slice(1)).toEqual([2, payload.content, payload.salt, payload.iv, true, false]);
  });

  it("findById filters by age and selects explicit columns", async () => {
    const { pool, query } = mockPool({ rows: [], rowCount: 0 });
    expect(await new MessageRepository(pool).findById("aZ09bY18cX")).toBeNull();
    const [text, params] = query.mock.calls[0];
    expect(text).toMatch(LIVE);
    expect(text).toMatch(/SELECT id, version, content, salt, iv, has_passphrase, burn_after_read, view_count, created_at/);
    expect(params).toEqual(["aZ09bY18cX"]);
  });

  it("openBurnMessage deletes atomically and returns the payload, then null", async () => {
    const row = { version: 2, content: "c", salt: "s", iv: "i", has_passphrase: false };
    const { pool, query } = mockPool({ rows: [row], rowCount: 1 }, { rows: [], rowCount: 0 });
    const repo = new MessageRepository(pool);

    expect(await repo.openBurnMessage("aZ09bY18cX")).toEqual(row);
    expect(await repo.openBurnMessage("aZ09bY18cX")).toBeNull();

    expect(query).toHaveBeenCalledTimes(2); // one statement per call
    const [text] = query.mock.calls[0];
    expect(text).toMatch(/DELETE FROM messages/);
    expect(text).toMatch(/WHERE id = \$1 AND burn_after_read/);
    expect(text).toMatch(LIVE);
    expect(text).toMatch(/RETURNING version, content, salt, iv, has_passphrase/);
    expect(text).toMatch(/UPDATE message_stats/);
    expect(text).toMatch(/view_count = view_count \+ 1/);
  });

  it("increaseViewCount skips burn and expired messages", async () => {
    const { pool, query } = mockPool({ rows: [], rowCount: 0 }, { rows: [{ id: "x" }], rowCount: 1 });
    const repo = new MessageRepository(pool);
    expect(await repo.increaseViewCount("aZ09bY18cX")).toBe(false);
    expect(await repo.increaseViewCount("aZ09bY18cX")).toBe(true);
    const [text] = query.mock.calls[0];
    expect(text).toMatch(/NOT burn_after_read/);
    expect(text).toMatch(LIVE);
  });

  it("getStats counts only rows younger than 24 h", async () => {
    const { pool, query } = mockPool(
      { rows: [{ created_count: 5, view_count: 7 }], rowCount: 1 },
      { rows: [{ count: "2" }], rowCount: 1 },
    );
    expect(await new MessageRepository(pool).getStats()).toEqual({
      created_count: 5,
      view_count: 7,
      expiring_soon_count: 2,
    });
    const countSql = query.mock.calls.map(c => c[0]).find(t => /COUNT\(\*\)/i.test(t));
    expect(countSql).toMatch(LIVE);
  });

  it("deleteExpiredMessages deletes rows older than 24 h", async () => {
    const { pool, query } = mockPool();
    await new MessageRepository(pool).deleteExpiredMessages();
    expect(query.mock.calls[0][0]).toMatch(/DELETE FROM messages\s+WHERE created_at <= NOW\(\) - INTERVAL '24 hours'/);
  });
});
