// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment node
// Real Postgres: runs only when TEST_DATABASE_URL points at a migrated
// database (skipped otherwise). With the local stack:
//   docker compose up -d --build   (the app container runs the migrations)
//   TEST_DATABASE_URL=postgres://whispeer:whispeer@127.0.0.1:5433/whispeer npx vitest run tests/server/repositories
/* eslint-disable import/no-named-as-default-member */
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MessageRepository } from "~/server/repositories/message.repository";
import type { EncryptedPayload } from "~/types/encrypted.message";

const url = process.env.TEST_DATABASE_URL;

const payload = (burn: boolean): EncryptedPayload => ({
  version: 2,
  content: "A".repeat(40),
  salt: "A".repeat(22),
  iv: "A".repeat(16),
  has_passphrase: false,
  burn_after_read: burn,
});

describe.skipIf(!url)("MessageRepository on a real database", () => {
  let pool: pg.Pool;
  let repo: MessageRepository;

  beforeAll(() => {
    pool = new pg.Pool({ connectionString: url, max: 10 });
    repo = new MessageRepository(pool);
  });

  afterAll(async () => {
    await pool?.end();
  });

  it("concurrent /open calls: exactly one gets the payload, then it is gone", async () => {
    for (let round = 0; round < 10; round++) {
      const { id } = await repo.save(payload(true));
      const results = await Promise.all(
        Array.from({ length: 5 }, () => repo.openBurnMessage(id)),
      );
      const opened = results.filter(r => r !== null);
      expect(opened).toHaveLength(1);
      expect(opened[0]).toMatchObject({ version: 2, content: "A".repeat(40) });
      expect(await repo.findById(id)).toBeNull();
      expect(await repo.openBurnMessage(id)).toBeNull();
    }
  });

  it("open counts one global view per burned message", async () => {
    const before = (await repo.getStats()).view_count;
    const { id } = await repo.save(payload(true));
    await Promise.all([repo.openBurnMessage(id), repo.openBurnMessage(id)]);
    expect((await repo.getStats()).view_count).toBe(before + 1);
  });

  it("open refuses normal messages; view count refuses burn messages", async () => {
    const normal = await repo.save(payload(false));
    expect(await repo.openBurnMessage(normal.id)).toBeNull();
    expect(await repo.findById(normal.id)).not.toBeNull();

    const burn = await repo.save(payload(true));
    expect(await repo.increaseViewCount(burn.id)).toBe(false);
    expect(await repo.increaseViewCount(normal.id)).toBe(true);
  });

  it("expired rows are neither readable nor openable", async () => {
    const normal = await repo.save(payload(false));
    const burn = await repo.save(payload(true));
    await pool.query(
      "UPDATE messages SET created_at = NOW() - INTERVAL '25 hours' WHERE id = ANY($1)",
      [[normal.id, burn.id]],
    );
    expect(await repo.findById(normal.id)).toBeNull();
    expect(await repo.increaseViewCount(normal.id)).toBe(false);
    expect(await repo.openBurnMessage(burn.id)).toBeNull();

    await repo.deleteExpiredMessages();
    const { rows } = await pool.query("SELECT id FROM messages WHERE id = ANY($1)", [
      [normal.id, burn.id],
    ]);
    expect(rows).toEqual([]);
  });
});
