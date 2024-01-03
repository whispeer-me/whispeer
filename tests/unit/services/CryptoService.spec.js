import CryptoService from "@/services/CryptoService";

describe("CryptoService", () => {
  const message = "Hello, World!";
  const passphrase = "secret";

  describe("encrypt and decrypt", () => {
    let encryptedResult;

    beforeAll(() => {
      // Encrypt the message first
      encryptedResult = CryptoService.encrypt(message, passphrase);
    });

    it("should encrypt the message with the given passphrase", () => {
      expect(encryptedResult).toHaveProperty("ciphertext");
      expect(encryptedResult).toHaveProperty("salt");
      expect(encryptedResult).toHaveProperty("iv");
    });

    it("should decrypt the ciphertext with the correct passphrase, salt, and iv", () => {
      const decryptedMessage = CryptoService.decrypt(
        encryptedResult.ciphertext,
        passphrase,
        encryptedResult.salt,
        encryptedResult.iv
      );

      expect(decryptedMessage).toBe(message);
    });

    it("should throw an error if the passphrase is incorrect", () => {
      expect(() => {
        CryptoService.decrypt(
          encryptedResult.ciphertext,
          "wrong passphrase",
          encryptedResult.salt,
          encryptedResult.iv
        );
      }).toThrowError("Incorrect passphrase");
    });
  });
});
