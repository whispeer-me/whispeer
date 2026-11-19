// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect } from "vitest";

import CryptoService, {
  CRYPTO_VERSION,
  PBKDF2_ITERATIONS,
} from "~/composables/crypto.service";
import type { EncryptedPayload } from "~/types/encrypted.message";

const B64URL = /^[A-Za-z0-9_-]+$/;

// Flip one bit of the decoded value and re-encode, keeping the length.
const flipFirstByte = (value: string): string => {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
  bytes[0] ^= 0x01;
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const expectDecryptFails = async (promise: Promise<unknown>) => {
  await expect(promise).rejects.toThrowError("Decryption failed");
};

describe("CryptoService v2", () => {
  const message = "Hello, World! ünïcödé 🔐";
  const passphrase = "correct horse battery staple";

  it("exports the format constants", () => {
    expect(CRYPTO_VERSION).toBe(2);
    expect(PBKDF2_ITERATIONS).toBe(600_000);
  });

  it("round trips without a passphrase", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });

    expect(payload.version).toBe(2);
    expect(payload.has_passphrase).toBe(false);
    expect(payload.burn_after_read).toBe(false);
    expect(payload.content).not.toContain("Hello");
    expect(await CryptoService.decrypt(payload, linkKey)).toBe(message);
  });

  it("round trips with a passphrase", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      passphrase,
      burnAfterRead: true,
    });

    expect(payload.has_passphrase).toBe(true);
    expect(payload.burn_after_read).toBe(true);
    expect(await CryptoService.decrypt(payload, linkKey, passphrase)).toBe(
      message,
    );
  });

  it("normalizes the passphrase to NFC", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      passphrase: "café-passphrase",
      burnAfterRead: false,
    });

    expect(
      await CryptoService.decrypt(payload, linkKey, "café-passphrase"),
    ).toBe(message);
  });

  it("fails with a wrong link key", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });
    await expectDecryptFails(
      CryptoService.decrypt(payload, flipFirstByte(linkKey)),
    );
  });

  it("fails with a malformed link key", async () => {
    const { payload } = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });
    await expectDecryptFails(CryptoService.decrypt(payload, "short"));
    await expectDecryptFails(CryptoService.decrypt(payload, ""));
  });

  it("fails with a wrong passphrase", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      passphrase,
      burnAfterRead: false,
    });
    await expectDecryptFails(
      CryptoService.decrypt(payload, linkKey, "wrong passphrase"),
    );
  });

  it("fails when the passphrase is missing but has_passphrase is set", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      passphrase,
      burnAfterRead: false,
    });
    await expectDecryptFails(CryptoService.decrypt(payload, linkKey));
    await expectDecryptFails(CryptoService.decrypt(payload, linkKey, ""));
  });

  it("fails when a ciphertext byte is flipped", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });
    await expectDecryptFails(
      CryptoService.decrypt(
        { ...payload, content: flipFirstByte(payload.content) },
        linkKey,
      ),
    );
  });

  it("fails when has_passphrase or burn_after_read is flipped (AAD)", async () => {
    const plain = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });
    await expectDecryptFails(
      CryptoService.decrypt(
        { ...plain.payload, burn_after_read: true },
        plain.linkKey,
      ),
    );
    await expectDecryptFails(
      CryptoService.decrypt(
        { ...plain.payload, has_passphrase: true },
        plain.linkKey,
        passphrase,
      ),
    );

    const withPass = await CryptoService.encrypt(message, {
      passphrase,
      burnAfterRead: true,
    });
    await expectDecryptFails(
      CryptoService.decrypt(
        { ...withPass.payload, has_passphrase: false },
        withPass.linkKey,
        passphrase,
      ),
    );
    await expectDecryptFails(
      CryptoService.decrypt(
        { ...withPass.payload, burn_after_read: false },
        withPass.linkKey,
        passphrase,
      ),
    );
  });

  it("fails when iv or salt is changed", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });
    await expectDecryptFails(
      CryptoService.decrypt({ ...payload, iv: flipFirstByte(payload.iv) }, linkKey),
    );
    await expectDecryptFails(
      CryptoService.decrypt(
        { ...payload, salt: flipFirstByte(payload.salt) },
        linkKey,
      ),
    );
  });

  it("fails when version is not 2", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });
    for (const version of [1, 3, 0]) {
      await expectDecryptFails(
        CryptoService.decrypt({ ...payload, version } as EncryptedPayload, linkKey),
      );
    }
  });

  it("throws on plaintext over 256 characters", async () => {
    await expect(
      CryptoService.encrypt("a".repeat(257), { burnAfterRead: false }),
    ).rejects.toThrow();
    const { linkKey, payload } = await CryptoService.encrypt("a".repeat(256), {
      burnAfterRead: false,
    });
    expect(await CryptoService.decrypt(payload, linkKey)).toBe("a".repeat(256));
  });

  it("gives different linkKey/salt/iv/content for the same text", async () => {
    const a = await CryptoService.encrypt(message, { burnAfterRead: false });
    const b = await CryptoService.encrypt(message, { burnAfterRead: false });

    expect(a.linkKey).not.toBe(b.linkKey);
    expect(a.payload.salt).not.toBe(b.payload.salt);
    expect(a.payload.iv).not.toBe(b.payload.iv);
    expect(a.payload.content).not.toBe(b.payload.content);
  });

  it("encodes values as unpadded base64url with the DESIGN lengths", async () => {
    const { linkKey, payload } = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });

    expect(linkKey).toMatch(B64URL);
    expect(payload.salt).toMatch(B64URL);
    expect(payload.iv).toMatch(B64URL);
    expect(payload.content).toMatch(B64URL);
    expect(linkKey).toHaveLength(43);
    expect(payload.salt).toHaveLength(22);
    expect(payload.iv).toHaveLength(16);

    const empty = await CryptoService.encrypt("", { burnAfterRead: false });
    expect(empty.payload.content).toHaveLength(22); // 16-byte tag only
  });

  it("returns exactly the payload keys the API accepts", async () => {
    const { payload } = await CryptoService.encrypt(message, {
      burnAfterRead: false,
    });
    expect(Object.keys(payload).sort()).toEqual(
      ["burn_after_read", "content", "has_passphrase", "iv", "salt", "version"],
    );
  });
});
