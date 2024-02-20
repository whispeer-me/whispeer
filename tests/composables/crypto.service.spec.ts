import { describe, it, expect, beforeAll } from "vitest";

import CryptoService from "~/composables/crypto-service";
import type EncryptedMessage from "~/types/encrypted.message";

describe("CryptoService", () => {
  const message = "Hello, World!";
  const passphrase = "secret";

  describe("encrypt and decrypt", () => {
    it("should encrypt the message with the given passphrase", () => {
      let encryptedResult: EncryptedMessage = CryptoService.encrypt(
        message,
        passphrase
      );
      expect(encryptedResult).toHaveProperty("ciphertext");
      expect(encryptedResult).toHaveProperty("salt");
      expect(encryptedResult).toHaveProperty("iv");
    });

    it("should decrypt the ciphertext with the correct passphrase, salt, and iv", () => {
      let encryptedResult: EncryptedMessage = CryptoService.encrypt(
        message,
        passphrase
      );
      const decryptedMessage = CryptoService.decrypt(
        encryptedResult.ciphertext,
        encryptedResult.salt,
        encryptedResult.iv,
        passphrase
      );

      expect(decryptedMessage).toBe(message);
    });

    it("should throw an error if the passphrase is incorrect", () => {
      expect(() => {
        let encryptedResult: EncryptedMessage = CryptoService.encrypt(
          message,
          passphrase
        );
        CryptoService.decrypt(
          encryptedResult.ciphertext,
          encryptedResult.salt,
          encryptedResult.iv,
          "wrong passphrase"
        );
      }).toThrowError("Incorrect passphrase");
    });
  });
});
