// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect, beforeAll } from "vitest";

import CryptoService from "~/composables/crypto.service";
import type { EncryptedPayload } from "~/types/encrypted.message";
import { validateMessagePayload } from "~/server/utils/validate.message";
import { isValidMessageId } from "~/server/utils/message.id";

let real: EncryptedPayload;

beforeAll(async () => {
  const { payload } = await CryptoService.encrypt("a".repeat(256), { burnAfterRead: true });
  real = payload;
});

const withField = (key: string, value: unknown) => ({ ...real, [key]: value });

describe("validateMessagePayload", () => {
  it("accepts a real payload from CryptoService.encrypt", () => {
    expect(validateMessagePayload(real)).toEqual(real);
  });

  it("accepts a short real payload", async () => {
    const { payload } = await CryptoService.encrypt("", { burnAfterRead: false });
    expect(validateMessagePayload(payload)).toEqual(payload);
  });

  it("accepts the largest real payload (256 x 3-byte UTF-8 chars)", async () => {
    const { payload } = await CryptoService.encrypt("€".repeat(256), { burnAfterRead: false });
    expect(validateMessagePayload(payload)).toEqual(payload);
  });

  it("returns only the known keys", () => {
    const result = validateMessagePayload(real);
    expect(Object.keys(result ?? {}).sort()).toEqual(
      ["burn_after_read", "content", "has_passphrase", "iv", "salt", "version"],
    );
  });

  it.each([null, undefined, "x", 1, [], true])("rejects non-object body %s", (body) => {
    expect(validateMessagePayload(body)).toBeNull();
  });

  it("rejects an extra key", () => {
    expect(validateMessagePayload({ ...real, is_private: false })).toBeNull();
  });

  it.each(["version", "content", "salt", "iv", "has_passphrase", "burn_after_read"])(
    "rejects missing %s",
    (key) => {
      const body: Record<string, unknown> = { ...real };
      delete body[key];
      expect(validateMessagePayload(body)).toBeNull();
    },
  );

  it.each([1, 3, "2", null, 2.5])("rejects version %s", (value) => {
    expect(validateMessagePayload(withField("version", value))).toBeNull();
  });

  it.each([
    ["plaintext", "Hello, World! This is a secret."],
    ["standard base64", "DKhgS9+OTPBBo0V4nl6Knw=="],
    ["too short", "A".repeat(21)],
    ["too long", "A".repeat(1049)],
    ["number", 123],
    ["null", null],
    ["invalid length mod 4", "A".repeat(25)],
  ])("rejects content: %s", (_label, value) => {
    expect(validateMessagePayload(withField("content", value))).toBeNull();
  });

  it("accepts content at the bounds", () => {
    expect(validateMessagePayload(withField("content", "A".repeat(22)))).not.toBeNull();
    expect(validateMessagePayload(withField("content", "A".repeat(1048)))).not.toBeNull();
  });

  it.each([
    "A".repeat(21),
    "A".repeat(23),
    "A".repeat(21) + "B", // non-canonical 16-byte encoding
    "A".repeat(20) + "+A",
    "1066970ac090c98c7b8753a40d785219",
    16,
  ])("rejects salt %s", (value) => {
    expect(validateMessagePayload(withField("salt", value))).toBeNull();
  });

  it.each(["A".repeat(15), "A".repeat(17), "A".repeat(15) + "=", "A".repeat(15) + "/", 12])(
    "rejects iv %s",
    (value) => {
      expect(validateMessagePayload(withField("iv", value))).toBeNull();
    },
  );

  it.each([["has_passphrase"], ["burn_after_read"]])("rejects non-boolean %s", (key) => {
    for (const value of ["true", 1, 0, null, "false"]) {
      expect(validateMessagePayload(withField(key, value))).toBeNull();
    }
  });
});

describe("isValidMessageId", () => {
  it("accepts 10 alphanumerics", () => {
    expect(isValidMessageId("aZ09bY18cX")).toBe(true);
  });

  it.each(["", "abc", "aZ09bY18cX1", "aZ09bY18c-", "aZ09bY18c ", "../etc/pas", undefined, null, 1234567890])(
    "rejects %s",
    (id) => {
      expect(isValidMessageId(id)).toBe(false);
    },
  );
});
