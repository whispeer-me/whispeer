// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { StoredMessage } from "~/server/entities/message";
import type { IMessageRepository } from "~/server/interfaces/repositories/IMessageRepository";
import type { EncryptedPayload } from "~/types/encrypted.message";

import { CreateMessage } from "~/server/usecases/message/create";
import { FindMessage } from "~/server/usecases/message/find.message";
import { OpenMessage } from "~/server/usecases/message/open.message";
import { PatchMessage } from "~/server/usecases/message/patch.message";

const VALID_ID = "aZ09bY18cX";
const CREATED_AT = new Date("2024-01-01T12:00:00Z");

const payload = (burn: boolean): EncryptedPayload => ({
  version: 2,
  content: "A".repeat(40),
  salt: "A".repeat(22),
  iv: "A".repeat(16),
  has_passphrase: false,
  burn_after_read: burn,
});

const stored = (burn: boolean): StoredMessage => ({
  id: VALID_ID,
  ...payload(burn),
  view_count: 3,
  created_at: CREATED_AT,
});

const mockRepo = (row: StoredMessage | null = null) => {
  const repo: IMessageRepository = {
    save: vi.fn().mockResolvedValue({ id: VALID_ID }),
    findById: vi.fn().mockResolvedValue(row),
    openBurnMessage: vi.fn().mockResolvedValue(null),
    increaseViewCount: vi.fn().mockResolvedValue(true),
    deleteExpiredMessages: vi.fn().mockResolvedValue(undefined),
    getStats: vi.fn().mockResolvedValue({ created_count: 0, view_count: 0, expiring_soon_count: 0 }),
  };
  return repo;
};

beforeEach(() => {
  vi.useFakeTimers().setSystemTime(new Date("2024-01-01T12:01:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("CreateMessage", () => {
  it("returns only the id", async () => {
    const repo = mockRepo();
    const result = await new CreateMessage(repo).execute(payload(false));
    expect(result).toEqual({ id: VALID_ID });
    expect(repo.save).toHaveBeenCalledWith(payload(false));
  });
});

describe("FindMessage", () => {
  it("returns the full payload for a normal message", async () => {
    const result = await new FindMessage(mockRepo(stored(false))).execute(VALID_ID);
    expect(result).toEqual({
      id: VALID_ID,
      ...payload(false),
      view_count: 3,
      expires_in: "23 hours and 59 minutes",
    });
  });

  it("hides content, salt and iv for a burn message", async () => {
    const result = await new FindMessage(mockRepo(stored(true))).execute(VALID_ID);
    expect(result).toEqual({
      id: VALID_ID,
      version: 2,
      has_passphrase: false,
      burn_after_read: true,
      expires_in: "23 hours and 59 minutes",
    });
    expect(result).not.toHaveProperty("content");
    expect(result).not.toHaveProperty("salt");
    expect(result).not.toHaveProperty("iv");
    expect(result).not.toHaveProperty("view_count");
  });

  it("returns null when not found", async () => {
    expect(await new FindMessage(mockRepo(null)).execute(VALID_ID)).toBeNull();
  });

  it.each(["short", "aZ09bY18cX1", "aZ09bY18c-", "' OR 1=1--"])(
    "returns null for bad id %s without touching the repository",
    async (id) => {
      const repo = mockRepo(stored(false));
      expect(await new FindMessage(repo).execute(id)).toBeNull();
      expect(repo.findById).not.toHaveBeenCalled();
    },
  );
});

describe("OpenMessage", () => {
  it("returns the payload once, then null", async () => {
    const repo = mockRepo();
    const { version, content, salt, iv } = payload(true);
    const opened = { version, content, salt, iv, has_passphrase: false };
    vi.mocked(repo.openBurnMessage)
      .mockResolvedValueOnce(opened)
      .mockResolvedValueOnce(null);
    const useCase = new OpenMessage(repo);

    expect(await useCase.execute(VALID_ID)).toEqual({ ...opened, burn_after_read: true });
    expect(await useCase.execute(VALID_ID)).toBeNull();
    expect(repo.openBurnMessage).toHaveBeenCalledTimes(2);
  });

  it("returns null for bad id without touching the repository", async () => {
    const repo = mockRepo();
    expect(await new OpenMessage(repo).execute("bad")).toBeNull();
    expect(repo.openBurnMessage).not.toHaveBeenCalled();
  });
});

describe("PatchMessage", () => {
  it("returns the repository result for a valid id", async () => {
    const repo = mockRepo();
    vi.mocked(repo.increaseViewCount).mockResolvedValueOnce(false);
    expect(await new PatchMessage(repo).execute(VALID_ID)).toBe(false);
    expect(repo.increaseViewCount).toHaveBeenCalledWith(VALID_ID);
  });

  it("returns false for bad id without touching the repository", async () => {
    const repo = mockRepo();
    expect(await new PatchMessage(repo).execute("bad/id")).toBe(false);
    expect(repo.increaseViewCount).not.toHaveBeenCalled();
  });
});
