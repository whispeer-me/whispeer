// SPDX-License-Identifier: AGPL-3.0-only

import type {
  EncryptedPayload,
  EncryptOptions,
  EncryptResult,
} from "~/types/encrypted.message";
import constants from "~/utils/constants";

// Format v2 (see tasks/sec/DESIGN.md). WebCrypto only.
export const CRYPTO_VERSION = 2;
export const PBKDF2_ITERATIONS = 600_000;
export const MAX_PLAINTEXT_CHARS = constants.MESSAGE_MAX_CHARS_ALLOWED;

const LINK_KEY_BYTES = 32;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BITS = 256;
const HKDF_INFO = "whispeer:v2";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

const subtle = () => globalThis.crypto.subtle;

const randomBytes = (length: number): Uint8Array => {
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
};

export const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const fromBase64Url = (value: string): Uint8Array => {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]*$/.test(value) || value.length % 4 === 1) {
    throw new Error("Invalid base64url");
  }
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const decodeExact = (value: string, length: number): Uint8Array => {
  const bytes = fromBase64Url(value);
  if (bytes.length !== length) {
    throw new Error("Invalid length");
  }
  return bytes;
};

// Shape check before anything irreversible (e.g. opening a burn message): 43
// base64url chars that decode to exactly 32 bytes in canonical form.
export const isValidLinkKey = (value: string): boolean => {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value)) {
    return false;
  }
  try {
    return toBase64Url(decodeExact(value, LINK_KEY_BYTES)) === value;
  } catch {
    return false;
  }
};

const buildAad = (hasPassphrase: boolean, burnAfterRead: boolean): Uint8Array => {
  return encoder.encode(
    `whispeer:v2:p${hasPassphrase ? 1 : 0}:b${burnAfterRead ? 1 : 0}`,
  );
};

const derivePassphraseBits = async (
  passphrase: string,
  salt: Uint8Array,
): Promise<Uint8Array> => {
  const baseKey = await subtle().importKey(
    "raw",
    encoder.encode(passphrase.normalize("NFC")),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await subtle().deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    baseKey,
    KEY_BITS,
  );
  return new Uint8Array(bits);
};

const deriveKey = async (
  linkKey: Uint8Array,
  salt: Uint8Array,
  passphrase: string | undefined,
  usage: KeyUsage,
): Promise<CryptoKey> => {
  let ikm = linkKey;
  if (passphrase !== undefined) {
    const p = await derivePassphraseBits(passphrase, salt);
    ikm = new Uint8Array(linkKey.length + p.length);
    ikm.set(linkKey, 0);
    ikm.set(p, linkKey.length);
  }

  const hkdfKey = await subtle().importKey("raw", ikm, "HKDF", false, [
    "deriveKey",
  ]);
  return subtle().deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode(HKDF_INFO) },
    hkdfKey,
    { name: "AES-GCM", length: KEY_BITS },
    false,
    [usage],
  );
};

export default class CryptoService {
  static async encrypt (
    plaintext: string,
    { passphrase, burnAfterRead }: EncryptOptions,
  ): Promise<EncryptResult> {
    if (typeof plaintext !== "string" || plaintext.length > MAX_PLAINTEXT_CHARS) {
      throw new Error(`Message exceeds ${MAX_PLAINTEXT_CHARS} characters.`);
    }
    // An empty passphrase must not silently produce an unprotected message.
    if (passphrase !== undefined && (typeof passphrase !== "string" || passphrase.length === 0)) {
      throw new Error("Passphrase must be a non-empty string.");
    }
    const hasPassphrase = passphrase !== undefined;
    const burn = burnAfterRead === true;

    const linkKey = randomBytes(LINK_KEY_BYTES);
    const salt = randomBytes(SALT_BYTES);
    const iv = randomBytes(IV_BYTES);

    const key = await deriveKey(
      linkKey,
      salt,
      hasPassphrase ? passphrase : undefined,
      "encrypt",
    );
    const ciphertext = await subtle().encrypt(
      { name: "AES-GCM", iv, additionalData: buildAad(hasPassphrase, burn) },
      key,
      encoder.encode(plaintext),
    );

    return {
      linkKey: toBase64Url(linkKey),
      payload: {
        version: CRYPTO_VERSION,
        content: toBase64Url(new Uint8Array(ciphertext)),
        salt: toBase64Url(salt),
        iv: toBase64Url(iv),
        has_passphrase: hasPassphrase,
        burn_after_read: burn,
      },
    };
  }

  static async decrypt (
    payload: EncryptedPayload,
    linkKey: string,
    passphrase?: string,
  ): Promise<string> {
    try {
      if (payload.version !== CRYPTO_VERSION) {
        throw new Error("Unsupported version");
      }
      const hasPassphrase = payload.has_passphrase;
      const burn = payload.burn_after_read;
      if (typeof hasPassphrase !== "boolean" || typeof burn !== "boolean") {
        throw new TypeError("Invalid flags");
      }
      if (hasPassphrase && (typeof passphrase !== "string" || passphrase.length === 0)) {
        throw new Error("Passphrase required");
      }

      const key = await deriveKey(
        decodeExact(linkKey, LINK_KEY_BYTES),
        decodeExact(payload.salt, SALT_BYTES),
        hasPassphrase ? passphrase : undefined,
        "decrypt",
      );
      const plaintext = await subtle().decrypt(
        {
          name: "AES-GCM",
          iv: decodeExact(payload.iv, IV_BYTES),
          additionalData: buildAad(hasPassphrase, burn),
        },
        key,
        fromBase64Url(payload.content),
      );
      return decoder.decode(plaintext);
    } catch {
      throw new Error("Decryption failed");
    }
  }
}
