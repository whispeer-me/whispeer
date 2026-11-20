// SPDX-License-Identifier: AGPL-3.0-only

/* eslint-disable camelcase */

import type { EncryptedPayload } from "~/types/encrypted.message";

const KEYS = ["version", "content", "salt", "iv", "has_passphrase", "burn_after_read"];

// Ciphertext + 16-byte tag: 16..786 bytes (256 chars of 3-byte UTF-8 = 768).
const CONTENT = /^[A-Za-z0-9_-]{22,1048}$/;
// 16 bytes: 21 free chars + one whose low 4 bits are zero (canonical encoding).
const SALT = /^[A-Za-z0-9_-]{21}[AQgw]$/;
// 12 bytes: exactly 16 chars, no padding.
const IV = /^[A-Za-z0-9_-]{16}$/;

// Returns a clean copy of the payload, or null if anything is off.
export const validateMessagePayload = (body: unknown): EncryptedPayload | null => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== KEYS.length || !KEYS.every(k => Object.hasOwn(record, k))) {
    return null;
  }

  const { version, content, salt, iv, has_passphrase, burn_after_read } = record;
  if (
    version !== 2 ||
    typeof content !== "string" || !CONTENT.test(content) || content.length % 4 === 1 ||
    typeof salt !== "string" || !SALT.test(salt) ||
    typeof iv !== "string" || !IV.test(iv) ||
    typeof has_passphrase !== "boolean" ||
    typeof burn_after_read !== "boolean"
  ) {
    return null;
  }

  return { version, content, salt, iv, has_passphrase, burn_after_read };
};
